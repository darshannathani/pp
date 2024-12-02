"use client";

import { countries } from "@/_constants/shared/country";
import {
  Button,
  Card,
  Label,
  TextInput,
  HR,
  Select,
  Textarea,
} from "flowbite-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { SpinnerComponent } from "@/components/shared/spinner/Spinner";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import { addYouTubeTask } from "@/_lib/store/features/creator/youTubeTask/youTubeTaskSlice";

const PLATFORM_FEE_PERCENTAGE = 0.05;
const PRICE_PER_THUMBNAIL = 5; // Assuming a price per thumbnail

export default function YouTubeForm({ setTaskCreated }) {
  const tester_gender = ["Male", "Female", "Both"];

  const dispatch = useAppDispatch();

  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const creator = useAppSelector((state) => state.userInfo.id);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      heading: "",
      tester_no: 0,
      noOfThumbNails: "",
      tester_age: 0,
      tester_gender: "",
      country: "",
      post_date: "",
      end_date: "",
      instruction: "",
    },
  });

  const tester_no = watch("tester_no");
  const noOfThumbNails = watch("noOfThumbNails");

  const pricingCalculation = useMemo(() => {
    const numTesters = parseInt(tester_no) || 0;
    const numThumbnails = parseInt(noOfThumbNails) || 0;
    const totalPrice = PRICE_PER_THUMBNAIL * numThumbnails * numTesters;
    const platformFee = totalPrice * PLATFORM_FEE_PERCENTAGE;
    const finalPrice = totalPrice/numTesters + platformFee;

    return {
      numTesters,
      numThumbnails,
      totalPrice,
      platformFee,
      finalPrice,
    };
  }, [tester_no, noOfThumbNails]);

  const onSubmit = async (data, event) => {
    event.preventDefault();
    setErrorMessage(null);
    setLoading(() => true);

    let post_date = new Date(data.post_date);
    let endDate = new Date(data.end_date);
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Set today's date to midnight for accurate comparison

    if (post_date < today) {
      setErrorMessage("Starting Date cannot be in the past");
      setLoading(() => false);
    } else if (post_date > endDate) {
      setErrorMessage("Starting Date cannot be after Ending Date");
      setLoading(() => false);
    } else {
      const formData = {
        creator,
        ...data,
        tester_no: Number(data.tester_no), // Convert tester_no to number
        tester_age: Number(data.tester_age), // Convert tester_age to number
      };

      setTimeout(() => {
        setLoading(() => false);
        dispatch(addYouTubeTask(formData));
        toast.success("Task created successfully....");
        setTaskCreated(() => true);
      }, 2000);
    }
  };

  return (
    <section>
        <div className="flex flex-col md:flex-row justify-center gap-24 px-5 py-8 md:px-14">
          <Card className="max-w-lg w-full">
          <div className="flex flex-col items-center">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 ">
              YouTube Thumbnail
            </h5>
          </div>

          <form
            method="POST"
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-4 md:flex-row">
              <div>
                <div className="block mb-2">
                  <Label htmlFor="heading" value="Task Name" />
                </div>
                <TextInput
                  id="heading"
                  type="text"
                  placeholder="Enter task name"
                  name="heading"
                  {...register("heading", {
                    required: "Task name is required",
                  })}
                  required
                />
              </div>
              <div>
                <div className="block mb-2">
                  <Label htmlFor="tester_no" value="No of Testers" />
                </div>
                <TextInput
                  id="tester_no"
                  type="number"
                  name="tester_no"
                  placeholder="xx"
                  {...register("tester_no", {
                    required: "No. of testers is required",
                  })}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div>
                <div className="block mb-2">
                  <Label htmlFor="noOfThumbNails" value="No of ThumbNails" />
                </div>
                <TextInput
                  id="noOfThumbNails"
                  type="number"
                  name="noOfThumbNails"
                  placeholder="xx"
                  max={4}
                  min={2}
                  {...register("noOfThumbNails", {
                    required: "No. of thumbnails is required",
                  })}
                  required
                />
              </div>
              <div>
                <div className="block mb-2">
                  <Label htmlFor="tester_age" value="Min age of Testers" />
                </div>
                <Select
                  id="tester_age"
                  name="tester_age"
                  defaultValue="NA"
                  {...register("tester_age", {
                    minLength: {
                      value: 1,
                      messtester_age: "Select tester_age",
                    },
                  })}
                  required
                >
                  <option value="NA" disabled>
                    Select tester_age
                  </option>
                  {Array.from({ length: 62 - 16 }, (_, index) => (
                    <option key={index + 16} value={index + 16}>
                      {index + 16}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:gap-16 md:flex-row">
              <div>
                <div>
                  <div className="block mb-2">
                    <Label htmlFor="tester_gender" value="Gender" />
                  </div>
                  <Select
                    id="tester_gender"
                    name="tester_gender"
                    defaultValue="NA"
                    {...register("tester_gender", {
                      minLength: {
                        value: 1,
                        messtester_age: "Select tester_gender",
                      },
                    })}
                    required
                  >
                    <option value="NA" disabled>
                      Select tester_gender
                    </option>
                    {tester_gender.map((test) => (
                      <option key={test} value={test}>
                        {test}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <div>
                  <div className="block mb-2">
                    <Label htmlFor="countries" value="Select your country" />
                  </div>
                  <Select
                    id="countries"
                    name="country"
                    defaultValue="NA"
                    {...register("country", {
                      minLength: {
                        value: 1,
                        messtester_age: "Select Country",
                      },
                    })}
                    required
                  >
                    <option value="NA" disabled>
                      Select Country
                    </option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:gap-16 md:flex-row">
              <div>
                <div className="block mb-2">
                  <Label htmlFor="post_date" value="Starting Date" />
                </div>

                <input
                  type="date"
                  name="post_date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  {...register("post_date", {
                    required: "Starting Date is required",
                  })}
                  required
                />
              </div>
              <div>
                <div className="block mb-2">
                  <Label htmlFor="end_date" value="Ending Date" />
                </div>

                <input
                  type="date"
                  name="end_date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  {...register("end_date", {
                    required: "Ending Date is required",
                  })}
                  required
                />
              </div>
            </div>
            <div>
              <div>
                <div className="block mb-2">
                  <Label
                    htmlFor="instruction"
                    className="min-w-full"
                    value="instruction"
                  />
                </div>
                <Textarea
                  id="instruction"
                  {...register("instruction", {
                    required: "Ending Date is required",
                  })}
                  placeholder="Enter instruction..."
                  required
                  rows={4}
                />
              </div>
            </div>
            <HR />

            <Button type="submit" color={"blue"}>
              {loading ? <SpinnerComponent /> : "Next"}
            </Button>
          </form>
        </Card>
        <div className="flex flex-col items-center w-full md:w-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <h5 className="text-xl font-bold text-gray-900 mb-4">Pricing Details</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Number of Testers:</span>
                <span>{pricingCalculation.numTesters}</span>
              </div>
              <div className="flex justify-between">
                <span>Number of Thumbnails:</span>
                <span>{pricingCalculation.numThumbnails}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Price:</span>
                <span>₹{pricingCalculation.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (5%):</span>
                <span>₹{pricingCalculation.platformFee.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Final Price deducted from wallet:</span>
                <span>₹{(pricingCalculation.finalPrice / pricingCalculation.numTesters).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Reward per Tester:</span>
                <span>₹{pricingCalculation.totalPrice.toFixed(2)/pricingCalculation.numTesters}</span>
              </div>
            </div>
            </div>
    
    {/* Image: Hidden on small screens */}
    <Image
      className="mt-8 hidden md:block"
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