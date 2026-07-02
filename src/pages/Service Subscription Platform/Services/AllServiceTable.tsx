import { useNavigate } from "react-router-dom";
import { FaDumbbell, FaHome, FaUserTie, FaSpa } from "react-icons/fa";

const StaticServiceTable = () => {

  const navigate = useNavigate();

  const services = [
    { id: 1, name: "Gym & Salon & Tech Industrial Services & Travel Agency", icon: <FaDumbbell /> },
    { id: 2, name: "Real Estate", icon: <FaHome /> },
  ];

  const handleRedirect = (id: number, service: string) => {

    if (service === "Gym & Salon & Tech Industrial Services & Travel Agency") {
      navigate(`/gym&otherservice`);
    }

    else if (service === "Real Estate") {
      navigate(`/properties`);
    }

    
  };

  return (

    <div className="p-8 bg-gray-100 min-h-screen">

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Service Categories
      </h2>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">

        <table className="min-w-full text-sm text-left">

          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-3">Icon</th>
              <th className="px-6 py-3">Service Name</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>

            {services.map((srv) => (
              <tr
                key={srv.id}
                className="border-b hover:bg-gray-100 transition"
              >

                <td className="px-6 py-4 text-blue-600 text-xl">
                  {srv.icon}
                </td>

                <td className="px-6 py-4 font-semibold text-gray-700">
                  {srv.name}
                </td>

                <td className="px-6 py-4 text-center">

                  <button
                    onClick={() => handleRedirect(srv.id, srv.name)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg transition"
                  >
                    View
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default StaticServiceTable;