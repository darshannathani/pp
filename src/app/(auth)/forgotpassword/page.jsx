"use client";

import { SpinnerComponent } from "@/components/shared/spinner/Spinner";
import {
  Button,
  Card,
  Checkbox,
  Label,
  TextInput,
  Radio,
} from "flowbite-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      role: null,
    },
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const isRoleSelected = watch("role");

  const onSubmit = async (data, event) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/forgot-password", {
        email: data.email,
        role: data.role,
      });

      if (response?.status === 200) {
        setSuccessMessage(response?.data?.message);
        toast.success(response?.data?.message);
        router.push("/login");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex justify-center gap-24 px-5 py-8 md:px-14">
      <Card className="max-w-lg">
        <div className="flex items-center space-x-4">
          <Image
            className="w-12 h-12 rounded-full"
            src="/images/logo.png"
            alt="Bonnie Green avatar"
            height={50}
            width={60}
          />
          <h5 className="text-2xl font-medium tracking-tight text-gray-900 ">
            uplift
          </h5>
        </div>
        <div className="flex flex-col items-left">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 ">
            Reset your password
          </h5>
          <p className="text-sm font-normal text-gray-700">
            We&apos;ll email you instructions to reset your password. If you
            can&apos;t access your email, you can try{" "}
            <span className="font-semibold text-blue-700 hover:cursor-pointer hover:underline">
              account recovery.
            </span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 ">
            <div className="mr-5">
              <Label htmlFor="lableUser" className="text-lg">
                User type :
              </Label>
            </div>
            <Radio
              id="creatorRadio"
              name="role"
              value="creator"
              className="cursor-pointer"
              {...register("role", { required: true })}
            />
            <Label htmlFor="creator" className="cursor-pointer">
              Creator
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Radio
              id="testerRadio"
              name="role"
              value="tester"
              className="cursor-pointer"
              {...register("role", { required: true })}
            />
            <Label htmlFor="tester" className="cursor-pointer">
              Tester
            </Label>
          </div>
        </div>
        <form
          method="POST"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div>
            <div className="block mb-2">
              <Label htmlFor="email" value="Email" />
            </div>
            <TextInput
              id="email"
              type="email"
              name="email"
              placeholder="name@company.com"
              {...register("email")}
              required
            />
            {errors?.email && setErrorMessage(null) && (
              <p className="mt-2 text-sm text-red-500">
                {errors?.email?.message}
              </p>
            )}
          </div>

          <div className="my-2">
            <div className="flex gap-1">
              <Checkbox checked disabled color={"blue"} id="remember" />
              <Label htmlFor="accept" className="text-gray-500">
                I agree to uplift&apos;s{" "}
                <span className="text-blue-700 hover:underline hover:cursor-pointer">
                  Terms of Use
                </span>{" "}
                and{" "}
                <span className="text-blue-700 hover:underline hover:cursor-pointer">
                  Privacy Policy.
                </span>
              </Label>
            </div>
          </div>
          <Button disabled={!isRoleSelected} type="submit" color={"blue"}>
            {loading ? <SpinnerComponent /> : "Reset Password"}
          </Button>
          {errorMessage && (
            <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="mt-2 text-sm text-green-500">{successMessage}</p>
          )}
          <p className="text-sm font-normal text-gray-700">
            If you still need help, contact{" "}
            <span className="font-semibold text-blue-700 hover:cursor-pointer hover:underline">
              uplift support.
            </span>
          </p>
        </form>
      </Card>
      <div className="hidden md:block ">
        <Image
          className="w-[450px] h-[450px]"
          src={"/images/OfficeMan.png"}
          width={450}
          height={400}
          alt="human desk"
        />
      </div>
    </section>
  );
}
