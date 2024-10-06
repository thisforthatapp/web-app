import React, { useState } from "react";

const Select: React.FC = () => {
  const [user1Items, setUser1Items] = useState<string[]>([]);
  const [user2Items, setUser2Items] = useState<string[]>([]);

  const addItem = (user: "user1" | "user2") => {
    const newItem = `New Item ${Math.floor(Math.random() * 100)}`;
    if (user === "user1") {
      setUser1Items([...user1Items, newItem]);
    } else {
      setUser2Items([...user2Items, newItem]);
    }
  };

  const proposeTrade = () => {
    alert("Trade proposed!");
  };
  return (
    <div className="flex flex-col h-screen bg-gray-200">
      {/* User 1 Section */}
      <div className="flex-1 p-5 bg-white relative">
        <button
          className="absolute top-5 right-5 px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => addItem("user1")}
        >
          Add NFT +
        </button>
        <div className="mt-12 flex flex-wrap gap-4">
          {user1Items.map((item, index) => (
            <div
              key={index}
              className="bg-blue-500 text-white p-4 rounded-lg flex-1 text-center"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* User 2 Section */}
      <div className="flex-1 p-5 bg-gray-100 relative">
        <button
          className="absolute top-5 right-5 px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => addItem("user2")}
        >
          Add Item +
        </button>
        <div className="mt-12 flex flex-wrap gap-4">
          {user2Items.map((item, index) => (
            <div
              key={index}
              className="bg-blue-500 text-white p-4 rounded-lg flex-1 text-center"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Propose Trade Button */}
      <button
        className="p-4 m-5 bg-gray-800 text-lg text-white rounded-lg font-semibold"
        onClick={proposeTrade}
      >
        Propose Trade
      </button>
    </div>
  );
};

export default Select;
