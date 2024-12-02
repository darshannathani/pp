"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Label,
  TextInput,
  Textarea,
  Progress,
  Modal,
} from "flowbite-react";
import { FaArrowLeft, FaTrash, FaUpload } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/_lib/store/hooks";
import { CldUploadWidget, CldImage } from "next-cloudinary";

const uploadOptions = {
  cloudName: "dyuys2vzy",
  uploadPreset: "uplift",
  tags: ["single-image-upload"],
};

const cloudinaryApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
const cloudName = "dyuys2vzy";

const MarketingResponse = ({ initialData }) => {
  const searchParams = useSearchParams();
  const testerId = useAppSelector((state) => state.userInfo.id);
  const taskId = searchParams.get("taskId");
  const router = useRouter();

  const [formData, setFormData] = useState({
    testerId: "",
    orderId: "",
    orderDate: "",
    liveReview: {
      taskId: "",
      reviewLink: "",
      reviewImage: "",
    },
  });

  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        testerId: testerId || initialData.testerId,
        liveReview: {
          ...prev.liveReview,
          ...initialData.liveReview,
          taskId: taskId || initialData.liveReview.taskId,
        },
      }));
      if (initialData.liveReview && initialData.liveReview.reviewImage) {
        setUploadedImage(initialData.liveReview.reviewImage);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        testerId,
        liveReview: {
          ...prev.liveReview,
          taskId,
        },
      }));
    }
  }, [initialData, testerId, taskId]);

  const handleInputChange = (e, nestedField = null) => {
    const { name, value } = e.target;
    if (nestedField) {
      setFormData((prev) => ({
        ...prev,
        [nestedField]: { ...prev[nestedField], [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSuccess = (result) => {
    const publicId = result.info.public_id;
    setUploadedImage(publicId);
    setFormData((prev) => ({
      ...prev,
      liveReview: {
        ...prev.liveReview,
        reviewImage: publicId,
      },
    }));
    setIsUploading(false);
    setUploadProgress(100);
    toast.success("Image uploaded successfully!");
  };

  const handleError = (error) => {
    setIsUploading(false);
    setUploadProgress(0);
    toast.error("Image upload failed!");
    console.error("Upload Error:", error);
  };

  const handleDelete = async () => {
    if (!uploadedImage) return;

    try {
      const timestamp = new Date().getTime();
      const string_to_sign = `public_id=${uploadedImage}&timestamp=${timestamp}${cloudinaryApiSecret}`;
      const signature = await generateSHA1(string_to_sign);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
          public_id: uploadedImage,
          signature: signature,
          api_key: cloudinaryApiKey,
          timestamp: timestamp,
        }
      );

      if (response.data.result === "ok") {
        setUploadedImage(null);
        setFormData((prev) => ({
          ...prev,
          liveReview: { ...prev.liveReview, reviewImage: "" },
        }));
        toast.success("Image removed successfully!");
      } else {
        throw new Error("Failed to delete image");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove image");
    }
  };

  const generateSHA1 = async (message) => {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleBack = () => {
    router.push("/dashboard?activeTab=available-task");
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    try {
      const response = await axios.post(
        "/api/task/marketing/taskResponse",
        formData
      );
      if (response.status === 201) {
        toast.success("Review submitted successfully!");
        router.push("/dashboard?activeTab=available-task");
        // You might want to redirect or clear the form here
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    }
  };

  return (
    <div className="max-w-2xl p-6 mx-auto">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Button color="light" onClick={handleBack}>
            <FaArrowLeft className="mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">Marketing Response</h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-[calc(100vh-200px)]"
        >
          <div className="flex-grow pr-4 space-y-4 overflow-y-auto">
            <div>
              <Label htmlFor="testerId">Tester ID</Label>
              <TextInput
                id="testerId"
                name="testerId"
                value={formData.testerId}
                onChange={handleInputChange}
                required
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <TextInput
                id="orderId"
                name="orderId"
                value={formData.orderId}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="orderDate">Order Date</Label>
              <TextInput
                id="orderDate"
                name="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="taskId">Task ID</Label>
              <TextInput
                id="taskId"
                name="taskId"
                value={formData.liveReview.taskId}
                onChange={(e) => handleInputChange(e, "liveReview")}
                required
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="reviewLink">Review Link</Label>
              <TextInput
                id="reviewLink"
                name="reviewLink"
                type="url"
                value={formData.liveReview.reviewLink}
                onChange={(e) => handleInputChange(e, "liveReview")}
                required
                placeholder="https://example.com/review/123"
              />
            </div>
            <div>
              <Label htmlFor="reviewImage">Review Image</Label>
              {uploadedImage ? (
                <div className="relative">
                  <CldImage
                    width={300}
                    height={200}
                    src={uploadedImage}
                    alt="Review"
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                  <Button
                    color="failure"
                    size="xs"
                    className="absolute top-2 right-2"
                    onClick={handleDelete}
                  >
                    <FaTrash className="mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <CldUploadWidget
                    uploadPreset={uploadOptions.uploadPreset}
                    options={uploadOptions}
                    onSuccess={handleSuccess}
                    onError={handleError}
                    onUpload={() => {
                      setIsUploading(true);
                      setUploadProgress(0);
                    }}
                    onProgress={(progress) => setUploadProgress(progress)}
                  >
                    {({ open }) => (
                      <Button
                        type="button"
                        color="blue"
                        onClick={open}
                        className="flex items-center justify-center w-full h-64"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <div className="w-full">
                            <Progress progress={uploadProgress} size="sm" />
                            <span className="mt-2">
                              Uploading... {uploadProgress}%
                            </span>
                          </div>
                        ) : (
                          <>
                            <FaUpload className="mr-2" />
                            Upload Image
                          </>
                        )}
                      </Button>
                    )}
                  </CldUploadWidget>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit" color="blue" className="w-full">
              Submit Review
            </Button>
          </div>
        </form>
      </Card>

      <Modal show={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <Modal.Header>Confirm Submission</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Are you sure you want to submit this review? This action cannot be
              undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="blue" onClick={confirmSubmit}>
            Yes, Submit
          </Button>
          <Button color="gray" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MarketingResponse;
