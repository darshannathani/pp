import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <section className="bg-white flex flex-col justify-center">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <Image
          className="justify-center mx-auto felx"
          height={350}
          width={350}
          alt="404 Graphics"
          src={"/images/404-computer.png"}
        />
        <h3 className="flex justify-center mb-4 text-base font-bold tracking-tight text-blue-600 md:text-2xl ">
          404 Not Found
        </h3>
        <p className="mb-4 flex justify-center text-xl md:text-3xl tracking-tight font-bold text-gray-900 ">
          Whoops! That page doesn’t exist.
        </p>
        <span className="flex justify-center ">
          Click here, to return
          <Link
            href="/"
            className="ml-2 font-semibold text-blue-600 cursor-pointer"
          >
            Home
          </Link>
        </span>
      </div>
    </section>
  );
}
