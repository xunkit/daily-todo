import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col gap-4 items-center py-8">
      <div>Welcome to DailyTodo</div>
      <a
        href="/app"
        className="px-4 py-2 bg-sky-300 text-sky-950 hover:bg-sky-400 rounded-full"
      >
        Go to App
      </a>
    </div>
  );
};

export default Home;
