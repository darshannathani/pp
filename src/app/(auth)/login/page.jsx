"use client";

import {
  Button,
  Card,
  Checkbox,
  Label,
  TextInput,
  HR,
  Radio,
} from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SpinnerComponent } from "@/components/shared/spinner/Spinner";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/_lib/store/hooks";
import { login } from "@/_lib/store/features/userInfo/userInfoSlice";
import { getCookie } from "cookies-next";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      role: null,
    },
  });

  useEffect(() => {
    if (getCookie("authorizeToken")) {
      router.push("/dashboard");
    }
  }, [router])

  const isRoleSelected = watch("role");
  const dispatch = useAppDispatch();
  const onSubmit = async (data, event) => {
    event.preventDefault();
    setErrorMessage(() => null);
    setLoading(() => true);
    try {
      let {
        status,
        data: { id, role },
      } = await axios.post("/api/auth/login", data);

      if (status === 200) {
        dispatch(login({ id, role }));
        toast.success("Login Successfully...");
        router.push("/dashboard");
      }
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            Welcome Back
          </h5>
          <p className="text-sm font-normal text-gray-700">
            Start your earning in seconds. Don’t have an account?{" "}
            <Link
              href={"/signup"}
              className="font-semibold text-blue-700 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 ">
            <div className="mr-5">
              <Label htmlFor="lableUser" className="text-lg">
                Signup as:
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
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-4 md:flex-row">
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
              <div>
                <div className="block mb-2">
                  <Label htmlFor="password" value="Password" />
                </div>
                <div className="relative">
                  <TextInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    name="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
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
                  <p className="md:max-w-[10rem] mt-2 text-sm text-red-500">
                    {errors?.password?.message}
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
              ? "To login with google please select role"
              : "Login with google"}
          </Button>

          <div className="flex items-center justify-between gap-2 my-2">
            <div className="flex gap-1">
              <Checkbox checked disabled color={"blue"} id="remember" />
              <Label htmlFor="remember">Remember me</Label>
            </div>
            <Link
              href={"/forgotpassword"}
              className="text-sm font-semibold text-blue-700"
            >
              Forgot Password?
            </Link>
          </div>

          <Button disabled={!isRoleSelected} type="submit" color={"blue"}>
            {loading ? <SpinnerComponent /> : "Sign in to your account"}
          </Button>
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