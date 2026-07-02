import { useState } from "react";
import { MdNotificationsActive } from "react-icons/md";
import DataTable from "../../components/common/DataTable";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";

interface Template {
  id: number;
  templateName: string;
  type: "Email" | "SMS";
  subject: string;
  body: string;
  status: "Active" | "Inactive";
}

const TemplateSchema = Yup.object().shape({
  templateName: Yup.string().required("Template Name is required"),
  type: Yup.string().required("Type is required"),
  subject: Yup.string().required("Subject is required"),
  body: Yup.string(),
  status: Yup.string().required("Status is required"),
});

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 1,
      templateName: "Order Confirmation",
      type: "Email",
      subject: "Your Order Has Been Confirmed!",
      body: "Dear {customer}, your order #{orderId} has been confirmed.",
      status: "Active",
    },
    {
      id: 2,
      templateName: "Low Stock Alert",
      type: "SMS",
      subject: "Low Stock Notification",
      body: "Product {product} is low on stock. Current qty: {quantity}.",
      status: "Inactive",
    },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleAdd = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Template) => {
    setEditingTemplate(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Template) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.templateName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setTemplates(templates.filter((t) => t.id !== item.id));
        Swal.fire("Deleted!", `"${item.templateName}" has been deleted.`, "success");
      }
    });
  };

  const handleView = (item: Template) => {
    Swal.fire({
      title: `Template: ${item.templateName}`,
      html: `
        <p><strong>Type:</strong> ${item.type}</p>
        <p><strong>Subject:</strong> ${item.subject}</p>
        <p><strong>Body:</strong> ${item.body || "N/A"}</p>
        <p><strong>Status:</strong> ${item.status}</p>
      `,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  const formik = useFormik({
    initialValues: {
      templateName: editingTemplate ? editingTemplate.templateName : "",
      type: editingTemplate ? editingTemplate.type : "",
      subject: editingTemplate ? editingTemplate.subject : "",
      body: editingTemplate ? editingTemplate.body : "",
      status: editingTemplate ? editingTemplate.status : "Active",
    },
    enableReinitialize: true,
    validationSchema: TemplateSchema,
    onSubmit: (values) => {
      if (editingTemplate) {
        setTemplates(
          templates.map((t) =>
            t.id === editingTemplate.id
              ? { ...t, ...values, type: values.type as "Email" | "SMS", status: values.status as "Active" | "Inactive" }
              : t
          )
        );
        Swal.fire({
          icon: "success",
          title: "Template Updated",
          text: `"${values.templateName}" has been updated!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const newTemplate: Template = {
          id: templates.length + 1,
          ...values,
          type: values.type as "Email" | "SMS",
          status: values.status as "Active" | "Inactive",
        };
        setTemplates([newTemplate, ...templates]);
        Swal.fire({
          icon: "success",
          title: "Template Added",
          text: `"${values.templateName}" has been added!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setModalOpen(false);
      formik.resetForm();
    },
  });

  return (
    <div className="">
      <DataTable
        title="Notification Templates"
        data={templates}
        columns={[
          { key: "templateName", label: "Template Name" },
          { key: "type", label: "Type" },
          { key: "subject", label: "Subject" },
          { key: "body", label: "Body", render: (item: Template) => <span>{item.body.slice(0, 50)}...</span> },
          {
            key: "status",
            label: "Status",
            render: (item: Template) => (
              <span className={`text-sm font-semibold ${item.status === "Active" ? "text-green-700" : "text-red-700"}`}>
                {item.status}
              </span>
            ),
          },
          // {
          //   key: "templateAction",
          //   label: "Action",
          //   render: (item: Template) => (
          //     <div className="flex gap-2">
          //       <button
          //         onClick={() => handleView(item)}
          //         className="px-2 py-1 bg-blue-500 text-white rounded"
          //       >
          //         View
          //       </button>
          //       <button
          //         onClick={() => handleEdit(item)}
          //         className="px-2 py-1 bg-yellow-500 text-white rounded"
          //       >
          //         Edit
          //       </button>
          //       <button
          //         onClick={() => handleDelete(item)}
          //         className="px-2 py-1 bg-red-500 text-white rounded"
          //       >
          //         Delete
          //       </button>
          //     </div>
          //   ),
          // },
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAdd={handleAdd}
        addButtonLabel="Add Template"
      />
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">{editingTemplate ? "Edit Template" : "Add Template"}</h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-semibold text-gray-700">Template Name</label>
                <input
                  type="text"
                  placeholder="Template Name"
                  name="templateName"
                  value={formik.values.templateName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.templateName && formik.errors.templateName
                      ? "customInputError"
                      : formik.values.templateName
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.templateName && formik.errors.templateName && (
                  <div className="text-red-500 text-sm">{formik.errors.templateName}</div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Type</label>
                <select
                  name="type"
                  value={formik.values.type}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value) {
                      e.currentTarget.classList.add("filled");
                    } else {
                      e.currentTarget.classList.remove("filled");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  className={`customSelect w-full ${
                    formik.touched.type && formik.errors.type
                      ? "customSelectError"
                      : formik.values.type
                      ? "filled"
                      : ""
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                </select>
                {formik.touched.type && formik.errors.type && (
                  <div className="text-red-500 text-sm">{formik.errors.type}</div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Subject</label>
                <input
                  type="text"
                  placeholder="Subject"
                  name="subject"
                  value={formik.values.subject}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.subject && formik.errors.subject
                      ? "customInputError"
                      : formik.values.subject
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.subject && formik.errors.subject && (
                  <div className="text-red-500 text-sm">{formik.errors.subject}</div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Body</label>
                <textarea
                  placeholder="Body"
                  name="body"
                  value={formik.values.body}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${formik.values.body ? "filled" : ""}`}
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700">Status</label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value) {
                      e.currentTarget.classList.add("filled");
                    } else {
                      e.currentTarget.classList.remove("filled");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  className={`customSelect w-full ${
                    formik.touched.status && formik.errors.status
                      ? "customSelectError"
                      : formik.values.status
                      ? "filled"
                      : ""
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className="text-red-500 text-sm">{formik.errors.status}</div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="customBtn">
                  Cancel
                </button>
                <button type="submit" className="customBtn">
                  {editingTemplate ? "Update" : "Add"}
                </button>
              </div>
            </form>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTemplates;