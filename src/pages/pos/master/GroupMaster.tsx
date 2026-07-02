import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface GroupMaster {
  id: number;             // Auto Increment ID
  groupId: string;        // Auto code GRP-001
  groupName: string;
  description: string;
  status: "Active" | "Inactive";
}

const GroupMaster = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<GroupMaster | null>(null);

  const [groups, setGroups] = useState<GroupMaster[]>([
    {
      id: 1,
      groupId: "GRP-001",
      groupName: "General Group",
      description: "Grouping used for items and suppliers",
      status: "Active",
    },
  ]);

  const [form, setForm] = useState<Omit<GroupMaster, "id" | "groupId">>({
    groupName: "",
    description: "",
    status: "Active",
  });

  const handleInput = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setEditingGroup(null);
    setForm({
      groupName: "",
      description: "",
      status: "Active",
    });
    setShowForm(true);
  };

  const handleEdit = (item: GroupMaster) => {
    setEditingGroup(item);
    setForm({
      groupName: item.groupName,
      description: item.description,
      status: item.status,
    });
    setShowForm(true);
  };

  const handleDelete = (item: GroupMaster) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete group "${item.groupName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        setGroups(groups.filter((g) => g.id !== item.id));
        Swal.fire("Deleted!", "Group deleted.", "success");
      }
    });
  };

  const handleSubmit = () => {
    if (!form.groupName) {
      Swal.fire("Required!", "Group Name is mandatory.", "warning");
      return;
    }

    if (editingGroup) {
      setGroups(
        groups.map((g) =>
          g.id === editingGroup.id ? { ...g, ...form } : g
        )
      );
      Swal.fire("Updated!", "Group updated successfully.", "success");
    } else {
      const newId = groups.length + 1;
      const newGroup: GroupMaster = {
        id: newId,
        groupId: `GRP-${String(newId).padStart(3, "0")}`,
        ...form,
      };
      setGroups([newGroup, ...groups]);
      Swal.fire("Created!", "Group added successfully.", "success");
    }

    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Group Master"
        data={groups}
        onAdd={handleAdd}
        addButtonLabel="Add Group"
        columns={[
          {
            key: "action",
            label: "Actions",
            render: (item: GroupMaster) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-2 py-1 bg-yellow-500 rounded text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="px-2 py-1 bg-red-500 rounded text-white"
                >
                  Delete
                </button>
              </div>
            ),
          },
          { key: "groupId", label: "Group ID" },
          { key: "groupName", label: "Group Name" },
          { key: "description", label: "Description" },
          { key: "status", label: "Status" },
        ]}
      />

      {/* ---------------- FORM MODAL ---------------- */}
      {showForm && (
        <div className="fixed inset-0 bg-[#00000070] flex justify-center items-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">

            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-5 text-gray-600 hover:text-black text-3xl"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {editingGroup ? "Edit Group" : "Add Group"}
            </h2>

            <div className="flex flex-col gap-3">

              <div>
                <label className="font-medium">Group Name</label>
                <input
                  name="groupName"
                  className="customInput"
                  placeholder="Enter Group Name"
                  value={form.groupName}
                  onChange={handleInput}
                />
              </div>

              <div>
                <label className="font-medium">Description</label>
                <textarea
                  name="description"
                  className="customInput"
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={handleInput}
                />
              </div>

              <div>
                <label className="font-medium">Status</label>
                <select
                  name="status"
                  className="customSelect"
                  value={form.status}
                  onChange={handleInput}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button onClick={handleSubmit} className="customBtn mt-4">
                {editingGroup ? "Update" : "Save"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMaster;
