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
  Modal,
} from "flowbite-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { SpinnerComponent } from "@/components/shared/spinner/Spinner";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import axios from "axios";
import { clearHistoryUser } from "@/_lib/store/features/shared/history/historyTesterSlice";

const PLATFORM_FEE_PERCENTAGE = 0.1;
const BASE_PRICE = 30; // Assuming a base price for app testing

export default function AppTestingForm({ setTaskCreated }) {
  const tester_gender = ["Male", "Female", "Both"];

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(null);

  const creator = useAppSelector((state) => state.userInfo.id);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      heading: "",
      tester_no: "",
      tester_age: "",
      tester_gender: "",
      country: "",
      instruction: "",
      post_date: "",
      end_date: "",
    },
  });

  const tester_no = watch("tester_no");

  const pricingCalculation = useMemo(() => {
    const numTesters = parseInt(tester_no) || 0;
    const totalPrice = BASE_PRICE * numTesters;
    const platformFee = totalPrice * PLATFORM_FEE_PERCENTAGE;
    const finalPrice = totalPrice - platformFee;

    return {
      numTesters,
      totalPrice,
      platformFee,
      finalPrice,
    };
  }, [tester_no]);

  const onSubmit = async (data, event) => {
    event.preventDefault();
    setFormData(data);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    setErrorMessage(null);
    setLoading(true);

    try {
      let post_date = new Date(formData.post_date);
      let endDate = new Date(formData.end_date);
      let today = new Date();
      today.setHours(0, 0, 0, 0); // Set today's date to midnight for accurate comparison

      if (post_date < today) {
        setErrorMessage("Starting Date cannot be in the past");
        setLoading(() => false);
      } else if (post_date > endDate) {
        setErrorMessage("Starting Date cannot be after Ending Date");
        setLoading(() => false);
      } else if ((endDate - post_date) / (1000 * 60 * 60 * 24) < 18) {
        setErrorMessage(
          "The difference between the Starting Date and Ending Date must be at least 14 days."
        );
        setLoading(() => false);
      } else {
        const dataToSend = {
          creator,
          ...formData,
          tester_no: Number(formData.tester_no), // Convert tester_no to number
          tester_age: Number(formData.tester_age), // Convert tester_age to number
        };
        // Make the API call to add the task
        const response = await axios.post("/api/task/app/addtask", dataToSend);

        // Handle success
        if (response.status === 200) {
          toast.success("Task created successfully.");
          dispatch(clearHistoryUser());
          setTaskCreated(true);
          router.push("/dashboard?activeTab=history");
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 402) {
          setErrorMessage("Insufficient funds in wallet");
          toast.error("Insufficient funds in wallet");
        } else {
          setErrorMessage("Failed to create task. Please try again.");
          console.error("Axios error:", error.response?.data || error.message);
        }
      } else {
        setErrorMessage(
          error.message || "Failed to create task. Please try again."
        );
        console.error("Non-Axios error:", error);
      }
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData(null);
  };

  return (
    <section>
      <div className="flex flex-col justify-center gap-24 px-5 py-8 md:flex-row md:px-14">
        <Card className="w-full max-w-lg">
          <div className="flex flex-col items-center">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900">
              App Review Form
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
                  min={20}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              <div>
                <div className="block mb-2">
                  <Label htmlFor="tester_age" value="Min Age of Testers" />
                </div>
                <Select
                  id="tester_age"
                  name="tester_age"
                  defaultValue="NA"
                  {...register("tester_age", {
                    required: "Select tester age",
                  })}
                  required
                >
                  <option value="NA" disabled>
                    Select tester age
                  </option>
                  {Array.from({ length: 62 - 16 }, (_, index) => (
                    <option key={index + 16} value={index + 16}>
                      {index + 16}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="block mb-2">
                  <Label htmlFor="tester_gender" value="Gender" />
                </div>
                <Select
                  id="tester_gender"
                  name="tester_gender"
                  defaultValue="NA"
                  {...register("tester_gender", {
                    required: "Select tester gender",
                  })}
                  required
                >
                  <option value="NA" disabled>
                    Select tester gender
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
              <div className="block mb-2">
                <Label htmlFor="country" value="Select Country" />
              </div>
              <Select
                id="country"
                name="country"
                defaultValue="NA"
                {...register("country", {
                  required: "Select Country",
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
              <div className="block mb-2">
                <Label htmlFor="instruction" value="Instruction" />
              </div>
              <Textarea
                id="instruction"
                {...register("instruction", {
                  required: "Instruction is required",
                })}
                placeholder="Enter instructions..."
                required
                rows={4}
              />
            </div>

            {errorMessage && (
              <p className="flex justify-center -mb-8 text-base font-normal text-red-500">
                {errorMessage}
              </p>
            )}
            <HR />

            <Button type="submit" color={"blue"}>
              {loading ? <SpinnerComponent /> : "Submit"}
            </Button>
          </form>
        </Card>

        <div className="flex flex-col items-center w-full md:w-auto">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            {/* Pricing Details */}
            <h5 className="mb-4 text-xl font-bold text-gray-900">
              Pricing Details
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Number of Testers:</span>
                <span>{pricingCalculation.numTesters}</span>
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
                <span>
                  ₹
                  {(
                    pricingCalculation.finalPrice /
                    pricingCalculation.numTesters
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Final Price deducted from wallet:</span>
                <span>₹{pricingCalculation.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Image: Hidden on small screens */}
          <Image
            className="hidden mt-8 md:block"
            src="/images/taskMan.png"
            width={450}
            height={400}
            alt="human desk"
          />
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="p-6 bg-white rounded-lg shadow-lg w-80">
            <h3 className="mb-4 text-lg font-bold">Confirm Upload</h3>
            <p className="mb-4">Are you sure you want to upload the task?</p>
            <div className="flex justify-end gap-4">
              <Button color="gray" onClick={handleCancel}>
                Cancel
              </Button>
              <Button color="blue" onClick={handleConfirm}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
