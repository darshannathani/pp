"use client";

import { countries } from "@/_constants/shared/country";
import {
  Button,
  Card,
  Checkbox,
  Label,
  TextInput,
  HR,
  Select,
  Radio,
} from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { SpinnerComponent } from "@/components/shared/spinner/Spinner";
import toast from "react-hot-toast";
import { getCookie } from "cookies-next";

export default function SignUp() {
  const gender = ["Male", "Female", "Others"];
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNo: "",
      password: "",
      cPassword: "",
      gender: "",
      role: "",
      pincode: "000000",
      dob: "",
      country: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isRoleSelected = watch("role");

  useEffect(() => {
    if (getCookie("authorizeToken")) {
      router.push("/dashboard");
    }
  }, [router])

  const onSubmit = async (data, event) => {
    event.preventDefault();
    setErrorMessage(null);
    setLoading(() => true);

    try {
      const { cPassword, ...formData } = data;
      const response = await axios.post("/api/auth/register", formData);
      toast.success("SignUp Successfully...");
      router.push("/login");
    } catch (error) {
      ({
        response: { data },
      } = error);

      if (data?.message) {
        setTimeout(() => {
          setErrorMessage(() => data?.message);
        }, 1500);

        setTimeout(() => {
          setErrorMessage(() => null);
          setLoading(() => false);
        }, 4800);
      }
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
            Create your Account
          </h5>
          <p className="text-sm font-normal text-gray-700">
            Start your earning in seconds. Already have an account?{" "}
            <Link
              href={"/login"}
              className="font-semibold text-blue-700 hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="mr-5">
              <Label htmlFor="lableUser" className="text-lg">
                Signup as:
              </Label>
            </div>
            <Radio
              id="creatorRadio"
              name="role"
              value="creator"
              {...register("role", { required: true })}
            />
            <Label htmlFor="creator">Creator</Label>
          </div>
          <div className="flex items-center gap-2">
            <Radio
              id="testerRadio"
              name="user"
              value="tester"
              {...register("role", { required: true })}
            />
            <Label htmlFor="tester">Tester</Label>
          </div>
        </div>
        <form
            method="POST"
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
          <div className="flex flex-col gap-4 md:flex-row">
            <div>
              <div className="block mb-2">
                <Label htmlFor="firstName" value="First Name" />
              </div>
              <TextInput
                id="firstName"
                type="text"
                placeholder="john"
                name="firstName"
                {...register("firstName", {
                  required: "Date of birth is required",
                })}
                required
              />
            </div>
            <div>
              <div className="block mb-2">
                <Label htmlFor="lastName" value="Last Name" />
              </div>
              <TextInput
                id="lastName"
                type="text"
                name="lastName"
                placeholder="doe"
                {...register("lastName", {
                  required: "Date of birth is required",
                })}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <div>
              <div className="block mb-2">
                <Label htmlFor="email" value="Email" />
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder="name@company.com"
                name="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Invalid email format",
                  },
                })}
                required
              />
            </div>
            <div>
              <div className="block mb-2">
                <Label htmlFor="mobileNo" value="Mobile" />
              </div>
              <TextInput
                id="mobileNo"
                type="text"
                placeholder="1234567890"
                required
                {...register("mobileNo", {
                  required: "Mobile number is required",
                  minLength: {
                    value: 10, // Adjust minimum length as needed
                    message: "Mobile number must be at least 10 digits",
                  },
                  maxLength: {
                    value: 13, // Adjust maximum length as needed
                    message: "Mobile number cannot exceed 13 digits",
                  },
                  pattern: {
                    value: /^\d+$/, // Allow only digits
                    message: "Mobile number must contain only numbers",
                  },
                })}
                name="mobileNo"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <div>
              <div>
                <div className="block mb-2">
                  <Label htmlFor="gender" value="Gender" />
                </div>
                <Select
                  id="gender"
                  name="gender"
                  defaultValue="NA"
                  {...register("gender", {
                    minLength: {
                      value: 1,
                      message: "Select Gender",
                    },
                  })}
                  required
                >
                  <option value="NA" disabled>
                    Select Gender
                  </option>
                  {gender.map((test) => (
                    <option key={test} value={test}>
                      {test}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="md:ml-16">
              <div className="block mb-2">
                <Label htmlFor="DOB" value="Date of birth" />
              </div>

              <input
                type="date"
                name="dob"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                {...register("dob", { required: "Date of birth is required" })}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
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
                      message: "Select Country",
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
            {isRoleSelected === "tester" && (
              <div className="md:ml-16">
                <div className="block mb-2">
                  <Label htmlFor="pincode" value="Pincode" />
                </div>
                <TextInput
                  id="pincode"
                  type="number"
                  name="pincode"
                  placeholder="xxxxxx"
                  {...register("pincode", {
                    required: "Pincode is required",
                  })}
                  required
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <div>
              <div className="block mb-2">
                <Label htmlFor="password" value="Password" />
              </div>
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    maxLength: {
                      value: 15,
                      message: "Password cannot exceed 15 characters",
                    },
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.",
                    },
                  })}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )}
                </button>
              </div>
              {errors?.password && (
                <p className="mt-2 text-sm text-red-500 md:max-w-[10rem]">
                  {errors?.password?.message}
                </p>
              )}
            </div>
            <div>
              <div className="block mb-2">
                <Label htmlFor="cPassword" value="Confirm password" />
              </div>
              <div className="relative">
                <TextInput
                  id="cPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="cPassword"
                  placeholder="••••••••"
                  {...register("cPassword", {
                    required: "Confirm password is required",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )}
                </button>
              </div>
              {errors?.cPassword && (
                <p className="mt-2 text-sm text-red-500 md:max-w-[10rem]">
                  {errors?.cPassword?.message}
                </p>
              )}
            </div>
          </div>
          {errorMessage && (
            <p className="flex justify-center -mb-8 text-base font-normal text-red-500">
              {errorMessage}
            </p>
          )}
          <HR />

          <Button disabled={!isRoleSelected} className="hidden" color={"light"}>
            <FcGoogle className="w-5 h-5 mr-2" />
            {!isRoleSelected
              ? "To sign up with google please select role"
              : "Sign up with google"}
          </Button>

          <div className="flex flex-col gap-3 my-2">
            <div className="flex gap-2">
              <Checkbox color={"blue"} checked disabled id="accept" />
              <Label htmlFor="accept" className="text-gray-500">
                By signing up, you are creating a uplift account and you agree
                to uplift{" "}
                <span className="text-blue-700 hover:underline hover:cursor-pointer">
                  Terms of Use
                </span>{" "}
                and{" "}
                <span className="text-blue-700 hover:underline hover:cursor-pointer">
                  Privacy Policy.
                </span>
              </Label>
            </div>
            <div className="flex gap-2">
              <Checkbox color={"blue"} id="acceptEmail" />
              <Label htmlFor="acceptEmail" className="text-gray-500">
                Email me about product updates and resources.
              </Label>
            </div>
          </div>
          <Button disabled={!isRoleSelected} type="submit" color={"blue"}>
            {loading ? <SpinnerComponent /> : "Create an account"}
          </Button>
          </form>
        </Card>
      <div className="items-center justify-center hidden md:flex ">
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