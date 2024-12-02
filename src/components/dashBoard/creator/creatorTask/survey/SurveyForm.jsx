"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import { addSurveyTask } from "@/_lib/store/features/creator/surveyTask/surveyTaskSlice";
import { countries } from "@/_constants/shared/country";
import { Button, Card, Label, TextInput, HR, Select, Textarea } from "flowbite-react";
import Image from "next/image";
import { SpinnerComponent } from "@/components/shared/spinner/Spinner";
import toast from "react-hot-toast";

const GENDER_OPTIONS = ["Male", "Female", "Both"];
const MIN_AGE = 16;
const MAX_AGE = 77;
const PLATFORM_FEE_PERCENTAGE = 0.1;
const PRICE_PER_QUESTION = 1;

export default function SurveyForm({ setTaskCreated }) {
  const dispatch = useAppDispatch();
  const creator = useAppSelector((state) => state.userInfo.id);

  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      heading: "",
      tester_no: "",
      noOfQuestions: "",
      tester_age: "",
      tester_gender: "",
      country: "",
      post_date: "",
      end_date: "",
      instruction: "",
    },
  });

  const noOfQuestions = watch("noOfQuestions");

  const pricingCalculation = useMemo(() => {
    const questionsCount = parseInt(noOfQuestions) || 0;
    const totalPrice = questionsCount * PRICE_PER_QUESTION;
    const platformFee = totalPrice * PLATFORM_FEE_PERCENTAGE;
    const finalPrice = totalPrice - platformFee;

    return {
      questionsCount,
      totalPrice,
      platformFee,
      finalPrice,
    };
  }, [noOfQuestions]);

  const onSubmit = async (data, event) => {
    event.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const post_date = new Date(data.post_date);
    const endDate = new Date(data.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (post_date < today) {
      setErrorMessage("Starting Date cannot be in the past");
    } else if (post_date > endDate) {
      setErrorMessage("Starting Date cannot be after Ending Date");
    } else {
      const formData = {
        creator,
        ...data,
        tester_no: Number(data.tester_no),
        tester_age: Number(data.tester_age),
        noOfQuestions: Number(data.noOfQuestions),
      };
      setTimeout(() => {
        dispatch(addSurveyTask(formData));
        toast.success("Task created successfully....");
        setTaskCreated(true);
      }, 2000);
    }

    setLoading(false);
  };

  const renderFormField = (label, id, type, options = {}) => (
    <div>
      <div className="block mb-2">
        <Label htmlFor={id} value={label} />
      </div>
      {type === "select" ? (
        <Select
          id={id}
          name={id}
          defaultValue="NA"
          {...register(id, { required: `${label} is required` })}
          required
        >
          <option value="NA" disabled>
            Select {label}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      ) : type === "textarea" ? (
        <Textarea
          id={id}
          {...register(id, { required: `${label} is required` })}
          placeholder={`Enter ${label.toLowerCase()}...`}
          required
          rows={4}
        />
      ) : (
        <TextInput
          id={id}
          type={type}
          placeholder={`Enter ${label.toLowerCase()}`}
          {...register(id, { required: `${label} is required` })}
          required
          {...options}
        />
      )}
    </div>
  );

  return (
    <section className="flex flex-col md:flex-row justify-center gap-8 px-5 py-8 md:px-14">
      {/* Main Survey Form */}
      <div className="flex-1">
        <Card>
          <div className="flex flex-col items-center mb-4">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900">
              Survey Task
            </h5>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {renderFormField("Task Name", "heading", "text")}
              {renderFormField("No of Testers", "tester_no", "number")}
              {renderFormField("No of Questions", "noOfQuestions", "number", { max: 20, min: 3 })}
              {renderFormField("Min age of Testers", "tester_age", "select", Array.from({ length: MAX_AGE - MIN_AGE }, (_, i) => i + MIN_AGE))}
              {renderFormField("Gender", "tester_gender", "select", GENDER_OPTIONS)}
              {renderFormField("Select your country", "country", "select", countries)}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {renderFormField("Starting Date", "post_date", "date")}
              {renderFormField("Ending Date", "end_date", "date")}
            </div>

            {renderFormField("Instruction", "instruction", "textarea")}

            {errorMessage && (
              <p className="text-base font-normal text-red-500 text-center">
                {errorMessage}
              </p>
            )}

            <HR />

            <Button type="submit" color="blue">
              {loading ? <SpinnerComponent /> : "Next"}
            </Button>
          </form>
        </Card>
      </div>
      {/* Pricing Card and TaskMan Image */}
      <div className="flex flex-col items-center md:w-1/3">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <h5 className="text-xl font-bold text-gray-900 mb-4">Pricing Details</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Questions:</span>
              <span>{pricingCalculation.questionsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Price:</span>
              <span>₹{pricingCalculation.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee (10%):</span>
              <span>₹{pricingCalculation.platformFee.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Reward per Tester:</span>
              <span>₹{pricingCalculation.finalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Final Price deducted from wallet:</span>
              <span>₹{pricingCalculation.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* TaskMan Image */}
        <div className="hidden lg:block mt-4 md:mt-8">
          <Image
            src="/images/taskMan.png"
            width={450}
            height={400}
            alt="human desk"
          />
        </div>
      </div>
    </section>
  );
}