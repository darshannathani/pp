import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import toast from "react-hot-toast";
import { setAnalyticsData } from "@/_lib/store/features/creator/analyticsData/analyticsDataSlice";
import Skeleton from "@/components/shared/skeleton/Skeleton";
import { CldImage } from "next-cloudinary";
import { Modal } from "flowbite-react";
import { FaChevronLeft } from "react-icons/fa";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const fetchAnalyticsData = async (id, type) => {
  try {
    const response = await axios.post("/api/task/analytics", { id, type });
    return response.data;
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    toast.error("Failed to fetch analytics data");
    return null;
  }
};

const renderSurveyAnalytics = ({
  task,
  handleBack,
  currentIndex,
  handlePrevious,
  handleNext,
}) => {
  const answer = task.answers[currentIndex];
  const options = Object.keys(answer.answers);
  const optiontoprint = Object.values(answer.answers).map((option) => option.option);
  const counts = options.map((option) => answer.answers[option].count);
  const barOptions = {
    chart: { type: "bar", height: 350 },
    xaxis: {
      categories: optiontoprint,
      title: { text: "Options" },
      labels: { show: false },
    },
    yaxis: {
      title: { text: "Frequency of Answers" },
    },
    title: {
      text: `Question ${currentIndex + 1}: ${answer.question}`,
      align: "left",
    },
    plotOptions: {
      bar: {
        distributed: true,
        horizontal: false,
      },
    },
    colors: ["#008FFB", "#00E396", "#FEB019", "#FF4560"],
  };

  const barSeries = [{ name: "Frequency", data: counts }];

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-lg">
      <button
        className="flex items-center text-blue-600 transition duration-300 hover:text-blue-800"
        onClick={handleBack}
      >
        <FaChevronLeft className="w-5 h-5 mr-2" />
        Back to Analytics Selection
      </button>
      <div className="absolute z-10 flex space-x-2 top-4 right-4">
        <button
          onClick={handlePrevious}
          className="px-4 py-2 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>
      <Chart
        options={barOptions}
        series={barSeries}
        type="bar"
        height={500}
        width="100%"
      />
    </div>
  );
};

const renderYoutubeAnalytics = ({
  task,
  handleBack,
  selectedImage,
  setSelectedImage,
}) => {
  // Extract options and counts from the task data
  const youtubeOptions = task.answers.answers.map((answer) => answer.option);
  const youtubeCounts = task.answers.answers.map((answer) => answer.count);

  // Define colors for the charts and image borders
  const colors = [
    "#008FFB",
    "#00E396",
    "#FEB019",
    "#FF4560",
    "#775DD0",
    "#546E7A",
    "#26a69a",
    "#D10CE8",
  ];

  // Configuration for the Bar Chart
  const barOptions = {
    chart: { type: "bar", height: 350 },
    xaxis: {
      categories: youtubeOptions,
      title: { text: "Options" },
      labels: { show: true }, // Show labels to identify options
    },
    yaxis: {
      title: { text: "Number of Votes" },
    },
    title: {
      text: "Bar Chart: Voting Results",
      align: "left",
    },
    plotOptions: {
      bar: {
        distributed: true,
        horizontal: false,
      },
    },
    colors: colors,
    legend: { show: false },
  };

  // Configuration for the Pie Chart
  const pieOptions = {
    chart: { type: "pie", height: 350 },
    labels: youtubeOptions,
    title: {
      text: "Pie Chart: Vote Distribution",
      align: "left",
    },
    colors: colors,
    legend: { show: false },
  };

  const barSeries = [{ name: "Votes", data: youtubeCounts }];
  const pieSeries = youtubeCounts;

  // Handler for keyboard accessibility
  const handleKeyPress = (event, option) => {
    if (event.key === "Enter" || event.key === " ") {
      setSelectedImage(option);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{task.heading}</h2>
        <button
          className="flex items-center text-blue-600 transition duration-300 hover:text-blue-800"
          onClick={handleBack}
        >
          <FaChevronLeft className="w-5 h-5 mr-2" />
          Back to Analytics Selection
        </button>
      </div>
      <p className="mb-6 text-gray-600">{task.instruction}</p>

      {/* Images Section */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        {youtubeOptions.map((option, index) => (
          <div key={index} className="relative">
            <div
              className="cursor-pointer"
              onClick={() => setSelectedImage(option)}
              onKeyPress={(e) => handleKeyPress(e, option)}
              tabIndex={0}
              role="button"
              aria-label={`View enlarged thumbnail ${index + 1}`}
              style={{ border: `8px solid ${colors[index % colors.length]}` }}
            >
              <CldImage
                src={option} // Use the actual option as the image source
                width={300}
                height={200}
                alt={`Thumbnail ${index + 1}`}
                className="object-cover w-full h-48 rounded-lg"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 text-white bg-black bg-opacity-50 rounded-b-lg">
              {youtubeCounts[index]} votes
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
        <Chart
          options={barOptions}
          series={barSeries}
          type="bar"
          height={350}
        />
        <Chart
          options={pieOptions}
          series={pieSeries}
          type="pie"
          height={350}
        />
      </div>

      {/* Modal for Enlarged Image */}
      <Modal
        show={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        size="xl"
      >
        <Modal.Header>
          <h3>Enlarged Image</h3>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-3 right-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            aria-label="Close modal"
          >
            &times;
          </button>
        </Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <CldImage
              src={selectedImage}
              width={800}
              height={600}
              alt="Enlarged thumbnail"
              className="object-contain w-full h-full"
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

const AnalyticsData = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const { analyticsData } = useAppSelector((state) => state.analyticsData);

  useEffect(() => {
    const getAnalyticsData = async () => {
      if (id && type) {
        const existingData = analyticsData.find((item) => item.task.id === id);

        if (!existingData) {
          const data = await fetchAnalyticsData(id, type);
          if (data?.task) {
            dispatch(setAnalyticsData([{ task: data.task }]));
          }
        }
        setIsLoading(false);
      }
    };

    getAnalyticsData();
  }, [id, type, dispatch, analyticsData]);

  if (isLoading) return <Skeleton className="container px-4 py-8 mx-auto" />;

  const currentData = analyticsData.find((item) => item.task.id === id);

  if (!currentData)
    return <p className="text-center text-gray-600">No data available</p>;

  const totalCharts = currentData.task.answers.length;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalCharts);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalCharts) % totalCharts);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">
        Analytics Data
      </h1>
      {currentData.task.type === "SurveyTask"
        ? renderSurveyAnalytics({
            task: currentData.task,
            currentIndex,
            handlePrevious,
            handleNext,
            handleBack,
          })
        : renderYoutubeAnalytics({
            task: currentData.task,
            handleBack,
            selectedImage,
            setSelectedImage,
          })}
    </div>
  );
};

export default AnalyticsData;