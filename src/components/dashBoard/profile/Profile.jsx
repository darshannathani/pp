import React, { useEffect, useState } from "react";
import { Card, Label, TextInput, Button, Checkbox, Spinner } from "flowbite-react";
import Image from "next/image";
import { useAppSelector } from "@/_lib/store/hooks";
import axios from "axios";

export default function Profile() {
  const user = useAppSelector((state) => state.userInfo);

  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    gender: "",
    role: "",
    dob: "",
    country: "",
    pincode: "",
    total_task: 0,
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user.id || !user.role) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/auth/profile?id=${user.id}&role=${user.role}`);
        setUserProfile(response.data);
        setEditedProfile(response.data);
      } catch (error) {
        setError(`Error fetching user profile: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user.id, user.role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.patch('/api/auth/update-profile', {
        userId: user.id,
        role: user.role,
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        gender: editedProfile.gender,
      });

      setUserProfile(prev => ({ ...prev, ...response.data }));
      setIsEditing(false);
    } catch (error) {
      setError(`Error updating profile: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-lg">
          <h5 className="text-2xl font-medium tracking-tight text-gray-900 mb-4">Error</h5>
          <p className="text-red-500">{error}</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex flex-col justify-center gap-24 px-5 py-8 md:flex-row md:px-14">
      <Card className="w-full max-w-lg">
        <div className="flex items-center mb-4 space-x-4">
          <Image
            className="w-12 h-12 rounded-full"
            src="/images/logo.png"
            alt="User avatar"
            height={50}
            width={60}
          />
          <h5 className="text-2xl font-medium tracking-tight text-gray-900">
            User Profile
          </h5>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {Object.entries(userProfile).map(([key, value]) => (
            <div key={key} className="w-full">
              <div className="block mb-2">
                <Label htmlFor={key} value={key.charAt(0).toUpperCase() + key.slice(1)} />
              </div>
              <TextInput
                id={key}
                name={key}
                type="text"
                value={editedProfile[key]}
                onChange={handleInputChange}
                className="text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          ))}
          <div className="flex flex-col gap-3 my-2">
            <div className="flex items-center gap-2">
              <Checkbox color="blue" checked disabled id="accept" />
              <Label htmlFor="accept" className="text-gray-500">
                By updating your profile, you agree to the{" "}
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
          {isEditing ? (
            <div className="flex gap-2">
              <Button type="submit" color="blue">
                Save Changes
              </Button>
              <Button type="button" color="gray" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button type="button" color="blue" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </form>
      </Card>
      <div className="items-center justify-center hidden md:flex">
        <Image
          className="w-[450px] h-[450px]"
          src="/images/UpdateProfile.png"
          width={450}
          height={400}
          alt="Office worker"
        />
      </div>
    </section>
  );
}