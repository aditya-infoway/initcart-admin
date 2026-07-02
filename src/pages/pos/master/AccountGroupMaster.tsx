import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface AccountGroup {
  id: number; // Auto increment ID
  groupId: string; // Auto code ACC-G001
  groupName: string;
  code: string;
  parentGroup: string;
  description: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdDate: string;
}

const AccountGroupMaster = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<AccountGroup | null>(null);

  const [groups, setGroups] = useState<AccountGroup[]>([
    {
      id: 1,
      groupId: "ACC-G001",
      groupName: "Assets",
      code: "A001",
      parentGroup: "Main Group",
      description: "Asset related accounts",
      status: "Active",
      createdBy: "System",
      createdDate: "2025-11-05",
    },
  ]);

  const [form, setForm] = useState<
    Omit<AccountGroup, "id" | "groupId" | "createdBy" | "createdDate">
  >({
    groupName: "",
    code: "",
    parentGroup: "",
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
      code: "",
      parentGroup: "",
      description: "",
      status: "Active",
    });
    setShowForm(true);
  };

  const handleEdit = (item: AccountGroup) => {
    setEditingGroup(item);
    setForm({
      groupName: item.groupName,
      code: item.code,
      parentGroup: item.parentGroup,
      description: item.description,
      status: item.status,
    });
    setShowForm(true);
  };

  const handleDelete = (item: AccountGroup) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete account group "${item.groupName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        setGroups(groups.filter((g) => g.id !== item.id));
        Swal.fire("Deleted!", "Account Group Deleted.", "success");
      }
    });
  };

  const handleSubmit = () => {
    if (!form.groupName || !form.code) {
      Swal.fire("Required!", "Group Name & Code are mandatory.", "warning");
      return;
    }

    if (editingGroup) {
      setGroups(
        groups.map((g) => (g.id === editingGroup.id ? { ...g, ...form } : g))
      );
      Swal.fire("Updated!", "Account Group updated successfully.", "success");
    } else {
      const newId = groups.length + 1;
      const newGroup: AccountGroup = {
        id: newId,
        groupId: `ACC-G${String(newId).padStart(3, "0")}`, // Auto Generate ACC-G001
        ...form,
        createdBy: "System",
        createdDate: new Date().toISOString().split("T")[0],
      };
      setGroups([newGroup, ...groups]);
      Swal.fire("Created!", "Account Group added successfully.", "success");
    }

    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Account Group Master"
        data={groups}
        onAdd={handleAdd}
        addButtonLabel="Add Group"
        columns={[
          {
            key: "action",
            label: "Actions",
            render: (item: AccountGroup) => (
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
          { key: "code", label: "Code" },
          { key: "parentGroup", label: "Parent Group" },
          { key: "status", label: "Status" },
          { key: "createdDate", label: "Created On" },
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
              {editingGroup ? "Edit Account Group" : "Add Account Group"}
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="font-medium">Group Name</label>
                <input
                  name="groupName"
                  className="customInput"
                  placeholder="Group Name"
                  value={form.groupName}
                  onChange={handleInput}
                />
              </div>
              <div>
                <label className="font-medium">Group Code</label>
                <input
                  name="code"
                  className="customInput"
                  placeholder="Group Code (Unique)"
                  value={form.code}
                  onChange={handleInput}
                />
              </div>
              <div>
                <label className="font-medium">Parent Group</label>
                <select
                  name="parentGroup"
                  className="customSelect"
                  value={form.parentGroup}
                  onChange={handleInput}
                >
                  <option value="">Select Parent Group</option>
                  <option value="Main Group">Main Group</option>
                  <option value="Assets">Assets</option>
                  <option value="Liabilities">Liabilities</option>
                </select>
              </div>
              <div>
                <label className="font-medium">Group Name</label>
                <textarea
                  name="description"
                  className="customInput"
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={handleInput}
                />
              </div>

              <div>
                <label className="font-medium">Group Name</label>
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

export default AccountGroupMaster;
