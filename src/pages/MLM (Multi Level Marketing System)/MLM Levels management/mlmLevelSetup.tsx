import { useEffect, useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";
import apiClient from "../../../api/apiClient";

interface MLMLevel {
  id: number;
  level_number: number;
  percentage: number;
}

const MLMLevelSetup = () => {

  const [data, setData] = useState<MLMLevel[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MLMLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {

      const res = await apiClient.get("mlm/levels/");
      setData(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formik = useFormik({

    initialValues: {
      level_number: editingItem?.level_number,
      percentage: editingItem?.percentage,
    },

    enableReinitialize: true,

    validationSchema: Yup.object({
      level_number: Yup.number().required("Required"),
      percentage: Yup.number()
        .required("Required")
        .min(0, "Must be positive"),
    }),

    onSubmit: async (values) => {

      setIsLoading(true);

      try {

        if (editingItem) {

          await apiClient.put(
            `mlm/levels/update/${editingItem.id}/`,
            values
          );

          Swal.fire("Updated!", "Level updated successfully", "success");

        } else {

          await apiClient.post("mlm/levels/", values);

          Swal.fire("Created!", "Level created successfully", "success");
        }

        fetchData();

        setModalOpen(false);
        setEditingItem(null);

        formik.resetForm();

      } catch (error: any) {

        Swal.fire(
          "Error",
          error?.response?.data?.non_field_errors ||
          error?.response?.data?.detail ||
          "Something went wrong",
          "error"
        );
      }

      setIsLoading(false);
    },
  });

  const handleEdit = (item: MLMLevel) => {

    setEditingItem(item);
    setModalOpen(true);

  };

  const handleDelete = (item: MLMLevel) => {

    Swal.fire({
      title: "Delete Level?",
      text: "This level will be removed",
      icon: "warning",
      showCancelButton: true,
    }).then(async (result) => {

      if (result.isConfirmed) {

        await apiClient.delete(
          `mlm/levels/delete/${item.id}/`
        );

        fetchData();

        Swal.fire("Deleted!", "Level deleted", "success");
      }

    });

  };

  return (
    <div>

      <DataTable<MLMLevel>

        data={data}

        columns={[
          { key: "level_number", label: "Level" },

          {
            key: "percentage",
            label: "Percentage",
            render: (item) => `${item.percentage}%`,
          },
        ]}

        onAdd={() => {
          setEditingItem(null);
          setModalOpen(true);
        }}

        onEdit={handleEdit}
        onDelete={handleDelete}

        addButtonLabel="Add Level"
        title="MLM Level Management"

      />

      {modalOpen && (

        <div className="fixed inset-0 flex items-center justify-center bg-[#0000007d]">

          <div className="bg-white p-6 rounded-lg w-[400px] relative">

            <h2 className="text-xl font-bold mb-4">

              {editingItem ? "Edit Level" : "Add Level"}

            </h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-3">

              <input
                type="number"
                name="level_number"
                placeholder="Level Number"
                value={formik.values.level_number}
                onChange={formik.handleChange}
                className="customInput"
              />

              <input
                type="number"
                name="percentage"
                placeholder="Percentage"
                value={formik.values.percentage}
                onChange={formik.handleChange}
                className="customInput"
              />

              <div className="flex justify-end gap-2 mt-4">

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {isLoading
                    ? "Processing..."
                    : editingItem
                    ? "Update"
                    : "Add"}
                </button>

              </div>

            </form>

            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-xl"
            >
              ×
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

export default MLMLevelSetup;