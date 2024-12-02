// file: components/Skeleton.js

const Skeleton = ({
  className = "",
  width = "100%",
  height = "100%",
  count = 1,
  shape = "rect",
}) => {
  const shapeClasses = shape === "circle" ? "rounded-full" : "rounded-lg";
  const skeletons = Array.from({ length: count });

  return (
    <div
      className={`grid gap-4 ${className} sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}
    >
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 ${shapeClasses}`}
          style={{ width, height }}
        ></div>
      ))}
    </div>
  );
};

export default Skeleton;
