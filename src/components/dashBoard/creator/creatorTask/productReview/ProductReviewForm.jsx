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
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { SpinnerComponent } from "@/components/shared/spinner/Spinner";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import axios from "axios";
import { clearHistoryUser } from "@/_lib/store/features/shared/history/historyTesterSlice";

const PLATFORM_FEE_PERCENTAGE = 0.05;

export default function ProductReviewForm({ setTaskCreated }) {
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
      product_link: "",
      product_price: "",
      refund_percentage: "",
      product_details: "",
    },
  });

  const tester_no = watch("tester_no");
  const product_price = watch("product_price");
  const refund_percentage = watch("refund_percentage");

  const pricingCalculation = useMemo(() => {
    // Use parseInt and parseFloat with fallbacks
    const numTesters = parseInt(tester_no, 10) || 0; 
    const refundPercentage = parseFloat(refund_percentage) || 0; 
    const productPrice = parseFloat(product_price) || 0;

    // Calculate total price
    const refundAmount = (refundPercentage / 100) * productPrice * numTesters;
    const platformCut = PLATFORM_FEE_PERCENTAGE * productPrice * numTesters;
    const totalPrice = refundAmount + platformCut;
    const platformFee = platformCut;
    const finalPrice = totalPrice;

    return {
      numTesters,
      totalPrice,
      platformFee,
      finalPrice,
    };
  }, [tester_no, product_price, refund_percentage]);



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
      today.setHours(0, 0, 0, 0);
  
      if (post_date < today) {
        throw new Error("Starting Date cannot be in the past");
      } else if (post_date > endDate) {
        throw new Error("Starting Date cannot be after Ending Date");
      }
  
      const dataToSend = { creator, ...formData };
      const response = await axios.post("/api/task/marketing/addtask", dataToSend);
  
      if (response.status === 200) {
        toast.success("Task created successfully.");
        dispatch(clearHistoryUser());
        setTaskCreated(true);
        router.push("/dashboard?activeTab=history");
      } else {
        throw new Error("Unexpected response status: " + response.status);
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
        setErrorMessage(error.message || "Failed to create task. Please try again.");
        console.error("Non-Axios error:", error);
      }
    } finally {
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
          <div className="flex flex-col items-center mb-4">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900">
              Product Marketing Form
            </h5>
          </div>

          <form
            method="POST"
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Task Name */}
            <div>
              <Label htmlFor="heading" value="Task Name" />
              <TextInput
                id="heading"
                type="text"
                placeholder="Enter task name"
                {...register("heading", { required: "Task name is required" })}
                required
              />
            </div>

            {/* Number of Testers and Min Age of Testers */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="tester_no" value="No. of Testers" />
                <TextInput
                  id="tester_no"
                  type="number"
                  {...register("tester_no", {
                    required: "No. of testers is required",
                    min: 20,
                  })}
                  required
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="tester_age" value="Min. Age of Testers" />
                <Select
                  id="tester_age"
                  {...register("tester_age", { required: "Select tester age" })}
                  required
                >
                  <option value="">Select tester age</option>
                  {Array.from({ length: 62 - 16 }, (_, index) => (
                    <option key={index + 16} value={index + 16}>
                      {index + 16}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Gender and Country */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="tester_gender" value="Gender" />
                <Select
                  id="tester_gender"
                  {...register("tester_gender", {
                    required: "Select tester gender",
                  })}
                  required
                >
                  <option value="">Select tester gender</option>
                  {tester_gender.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="country" value="Select Country" />
                <Select
                  id="country"
                  {...register("country", { required: "Select Country" })}
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Starting Date and Ending Date */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="post_date" value="Starting Date" />
                <input
                  type="date"
                  id="post_date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  {...register("post_date", {
                    required: "Starting Date is required",
                  })}
                  required
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="end_date" value="Ending Date" />
                <input
                  type="date"
                  id="end_date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  {...register("end_date", {
                    required: "Ending Date is required",
                  })}
                  required
                />
              </div>
            </div>

            {/* Instruction */}
            <div>
              <Label htmlFor="instruction" value="Instruction" />
              <Textarea
                id="instruction"
                placeholder="Enter instructions..."
                {...register("instruction", {
                  required: "Instruction is required",
                })}
                required
                rows={3}
              />
            </div>

            {/* Product Link */}
            <div>
              <Label htmlFor="product_link" value="Product Link" />
              <TextInput
                id="product_link"
                type="url"
                placeholder="Enter product link"
                {...register("product_link", {
                  required: "Product link is required",
                })}
                required
              />
            </div>

            {/* Product Price and Refund Percentage */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="product_price" value="Product Price" />
                <TextInput
                  id="product_price"
                  type="number"
                  step="0.01"
                  placeholder="Enter product price"
                  {...register("product_price", {
                    required: "Product price is required",
                  })}
                  required
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="refund_percentage" value="Refund Percentage" />
                <TextInput
                  id="refund_percentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter refund percentage"
                  {...register("refund_percentage", {
                    required: "Refund percentage is required",
                  })}
                  required
                />
              </div>
            </div>

            {/* Product Details */}
            <div>
              <Label htmlFor="product_details" value="Product Details" />
              <Textarea
                id="product_details"
                placeholder="Enter product details..."
                {...register("product_details", {
                  required: "Product details are required",
                })}
                required
                rows={3}
              />
            </div>

            {errorMessage && (
              <p className="flex justify-center text-base font-normal text-red-500">
                {errorMessage}
              </p>
            )}
            <HR />

            <Button type="submit" color="blue">
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
              {/* <div className="flex justify-between">
                <span>Price of Product:</span>
                <span>{pricingCalculation.productPrice > 0 && pricingCalculation.numTesters > 0 ? (pricingCalculation.productPrice / pricingCalculation.numTesters).toFixed(2) : "0.00"}</span>
              </div> */}
              <div className="flex justify-between">
                <span>Platform Fee (10%):</span>
                <span>₹{pricingCalculation.platformFee.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Final Price deducted from wallet:</span>
                <span>₹{pricingCalculation.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Reward per Tester:</span>
                <span>
                  ₹
                  {(
                    (pricingCalculation.finalPrice-pricingCalculation.platformFee) /
                    pricingCalculation.numTesters
                  ).toFixed(2)}
                </span>
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
