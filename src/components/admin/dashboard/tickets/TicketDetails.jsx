import React from "react";
import { Badge } from "flowbite-react";
import { CldImage } from "next-cloudinary";

const TicketDetails = ({ selectedTask }) => {
  if (!selectedTask) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="pr-4 space-y-4 overflow-y-auto h-96">
      <div>
        <h4 className="font-semibold text-md">{selectedTask.task.heading}</h4>
        <Badge
          color={selectedTask.task.task_flag === "Open" ? "success" : "failure"}
        >
          {selectedTask.task.task_flag}
        </Badge>
      </div>
      <p>
        <strong>Type:</strong> {selectedTask.task.type}
      </p>
      <p>
        <strong>Country:</strong> {selectedTask.task.country}
      </p>
      <p>
        <strong>Tester Age:</strong> {selectedTask.task.tester_age}
      </p>
      <p>
        <strong>Tester Gender:</strong> {selectedTask.task.tester_gender}
      </p>
      <p>
        <strong>Number of Testers:</strong> {selectedTask.task.tester_no}
      </p>
      <p>
        <strong>Post Date:</strong>{" "}
        {new Date(selectedTask.task.post_date).toLocaleDateString()}
      </p>
      <p>
        <strong>End Date:</strong>{" "}
        {new Date(selectedTask.task.end_date).toLocaleDateString()}
      </p>
      <div>
        <h5 className="font-semibold text-md">Instructions</h5>
        <p>{selectedTask.task.instruction}</p>
      </div>

      {selectedTask.task.type === "MarketingTask" && (
        <div>
          <h5 className="font-semibold text-md">Product Details</h5>
          <p>{selectedTask.specificTask.product_details}</p>
          <p>
            <strong>Product Link:</strong>{" "}
            <a
              href={selectedTask.specificTask.product_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {selectedTask.specificTask.product_link}
            </a>
          </p>
          <p>
            <strong>Product Price:</strong> ₹
            {selectedTask.specificTask.product_price}
          </p>
          <p>
            <strong>Refund Percentage:</strong>{" "}
            {selectedTask.specificTask.refund_percentage}%
          </p>
        </div>
      )}

      {selectedTask.task.type === "AppTask" && (
        <div>
          <h5 className="font-semibold text-md">Tester Status</h5>
          <div className="space-y-2">
            <p>
              <strong>Applied Testers:</strong>{" "}
              {selectedTask.specificTask.applied_testers.length}
            </p>
            <p>
              <strong>Selected Testers:</strong>{" "}
              {selectedTask.specificTask.selected_testers.length}
            </p>
            <p>
              <strong>Rejected Testers:</strong>{" "}
              {selectedTask.specificTask.rejected_testers.length}
            </p>
          </div>
        </div>
      )}

      {selectedTask.task.type === "MarketingTask" &&
        selectedTask.response &&
        selectedTask.response.length > 0 && (
          <div>
            <h5 className="font-semibold text-md">Tester Responses</h5>
            {selectedTask.response.map((resp, index) => (
              <div key={index} className="p-4 mb-4 bg-gray-100 rounded-lg">
                <p>
                  <strong>Order ID:</strong> {resp.order.orderId}
                </p>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(resp.order.orderDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Review Link:</strong>{" "}
                  <a
                    href={resp.liveReview.reviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {resp.liveReview.reviewLink}
                  </a>
                </p>
                <p>
                  <strong>Submitted At:</strong>{" "}
                  {new Date(resp.liveReview.submittedAt).toLocaleString()}
                </p>
                {resp.liveReview.reviewImage && (
                  <CldImage
                    src={resp.liveReview.reviewImage}
                    width={300}
                    height={200}
                    alt="Review Image"
                    className="mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        )}

      {selectedTask.task.type === "AppTask" &&
        selectedTask.response &&
        selectedTask.response.length > 0 && (
          <div>
            <h5 className="font-semibold text-md">Tester Responses</h5>
            {selectedTask.response.map((resp, index) => (
              <div key={index} className="p-4 mb-4 bg-gray-100 rounded-lg">
                <p>
                  <strong>Tester ID:</strong> {resp.testerId}
                </p>
                {resp.responses.map((response, rIndex) => (
                  <div key={rIndex} className="mt-2">
                    <p>
                      <strong>Response:</strong> {response.text}
                    </p>
                    <p>
                      <strong>Date:</strong> {formatDate(response.date)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default TicketDetails;
