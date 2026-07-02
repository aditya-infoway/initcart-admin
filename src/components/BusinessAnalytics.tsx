import React, { type FC, type JSX } from "react";
import { MdOutlinePendingActions, MdOutlineCancel } from "react-icons/md";
import { FaBoxOpen, FaShoppingBag } from "react-icons/fa";
import {
  AiOutlineCheckCircle,
  AiOutlineSend,
  AiOutlineUser,
} from "react-icons/ai";
import { TbTruckDelivery } from "react-icons/tb";

interface StatsItem {
  label: string;
  count: number;
  icon: JSX.Element;
  bgColor?: string;
  textColor?: string;
}

const businessStats: StatsItem[] = [
  {
    label: "Total Orders",
    count: 195,
    icon: <MdOutlinePendingActions size={24} />,
    bgColor: "from-blue-500 to-indigo-500",
  },
  {
    label: "Total Stores",
    count: 10,
    icon: <FaShoppingBag size={24} />,
    bgColor: "from-purple-500 to-pink-500",
  },
  {
    label: "Total Products",
    count: 402,
    icon: <FaBoxOpen size={24} />,
    bgColor: "from-orange-400 to-amber-500",
  },
  {
    label: "Total Customers",
    count: 7,
    icon: <AiOutlineUser size={24} />,
    bgColor: "from-green-400 to-emerald-500",
  },
];

const orderStatus: StatsItem[] = [
  {
    label: "Pending",
    count: 58,
    icon: <MdOutlinePendingActions size={22} />,
    textColor: "text-blue-700",
  },
  {
    label: "Confirmed",
    count: 21,
    icon: <AiOutlineCheckCircle size={22} />,
    textColor: "text-green-600",
  },
  {
    label: "Packaging",
    count: 9,
    icon: <FaBoxOpen size={22} />,
    textColor: "text-yellow-600",
  },
  {
    label: "Out for delivery",
    count: 0,
    icon: <AiOutlineSend size={22} />,
    textColor: "text-purple-600",
  },
  {
    label: "Delivered",
    count: 81,
    icon: <TbTruckDelivery size={22} />,
    textColor: "text-green-700",
  },
  {
    label: "Canceled",
    count: 9,
    icon: <MdOutlineCancel size={22} />,
    textColor: "text-red-600",
  },
  {
    label: "Returned",
    count: 4,
    icon: <AiOutlineSend size={22} />,
    textColor: "text-pink-600",
  },
  {
    label: "Failed to delivery",
    count: 0,
    icon: <MdOutlineCancel size={22} />,
    textColor: "text-red-500",
  },
];

const BusinessAnalytics: FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <h2 className="flex items-center text-gray-900 font-semibold text-xl tracking-wide">
        <FaBoxOpen className="mr-2 text-indigo-600" /> Business Analytics
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {businessStats.map((stat) => (
          <div
            key={stat.label}
            className="relative bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-gray-500 font-medium ">{stat.label}</p>
              <p className="text-gray-900 text-2xl font-extrabold mt-1">
                {stat.count}
              </p>
            </div>
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor} text-white shadow-sm`}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Order Status Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {orderStatus.map((status) => (
            <div
              key={status.label}
              className="group bg-gradient-to-br from-gray-50 to-white hover:from-indigo-50 hover:to-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">{status.icon}</div>
              <p className="text-gray-600  font-medium mb-1">
                {status.label}
              </p>
              <div
                className={`font-bold text-lg ${status.textColor} group-hover:scale-110 transform transition-transform duration-300`}
              >
                {status.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalytics;
