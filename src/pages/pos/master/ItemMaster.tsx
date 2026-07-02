import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface ItemMaster {
  id: number;
  itemId: string;
  itemName: string;
  sku: string;
  barcode: string;
  group: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  taxScheme: string;
  openingStock: number;
  reorderLevel: number;
  leadTimeDays: number;
  hsCode: string;
  description: string;
  itemImage?: string;
  status: "Active" | "Inactive";
}

const ItemMaster = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemMaster | null>(null);

  const [items, setItems] = useState<ItemMaster[]>([
    {
      id: 1,
      itemId: "ITM-001",
      itemName: "Parle-G 500gm",
      sku: "SKU-PRLG500",
      barcode: "89011112345",
      group: "Snacks",
      unit: "Pcs",
      purchasePrice: 20,
      sellingPrice: 25,
      mrp: 30,
      taxScheme: "GST 18%",
      openingStock: 100,
      reorderLevel: 20,
      leadTimeDays: 7,
      hsCode: "19053100",
      description: "Pack of biscuits",
      itemImage: "",
      status: "Active",
    },
  ]);

  const [form, setForm] = useState<Omit<ItemMaster, "id" | "itemId">>({
    itemName: "",
    sku: "",
    barcode: "",
    group: "",
    unit: "",
    purchasePrice: 0,
    sellingPrice: 0,
    mrp: 0,
    taxScheme: "",
    openingStock: 0,
    reorderLevel: 0,
    leadTimeDays: 0,
    hsCode: "",
    description: "",
    itemImage: "",
    status: "Active",
  });

  const handleInput = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, itemImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setForm({
      itemName: "",
      sku: "",
      barcode: "",
      group: "",
      unit: "",
      purchasePrice: 0,
      sellingPrice: 0,
      mrp: 0,
      taxScheme: "",
      openingStock: 0,
      reorderLevel: 0,
      leadTimeDays: 0,
      hsCode: "",
      description: "",
      itemImage: "",
      status: "Active",
    });
    setShowForm(true);
  };

  const handleEdit = (item: ItemMaster) => {
    setEditingItem(item);
    setForm({ ...item });
    setShowForm(true);
  };

  const handleDelete = (item: ItemMaster) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete item "${item.itemName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        setItems(items.filter((i) => i.id !== item.id));
        Swal.fire("Deleted!", "Item deleted successfully.", "success");
      }
    });
  };

  const handleSubmit = () => {
    if (!form.itemName || !form.sku) {
      Swal.fire("Required!", "Item Name & SKU are mandatory.", "warning");
      return;
    }

    if (editingItem) {
      setItems(
        items.map((i) => (i.id === editingItem.id ? { ...i, ...form } : i))
      );
      Swal.fire("Updated!", "Item updated successfully.", "success");
    } else {
      const newId = items.length + 1;
      const newItem: ItemMaster = {
        id: newId,
        itemId: `ITM-${String(newId).padStart(3, "0")}`,
        ...form,
      };

      setItems([newItem, ...items]);
      Swal.fire("Created!", "Item added successfully.", "success");
    }

    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Item Master"
        data={items}
        onAdd={handleAdd}
        addButtonLabel="Add Item"
        columns={[
          {
            key: "action",
            label: "Actions",
            render: (item: ItemMaster) => (
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
          { key: "itemId", label: "Item ID" },
          { key: "itemName", label: "Item Name" },
          { key: "sku", label: "SKU" },
          { key: "barcode", label: "Barcode" },
          { key: "group", label: "Group" },
          { key: "unit", label: "Unit" },
          { key: "sellingPrice", label: "Selling Price" },
          { key: "status", label: "Status" },
        ]}
      />

      {/* -------- FORM MODAL ---------- */}
      {showForm && (
        <div className="fixed inset-0 bg-[#00000070] flex justify-center items-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">

            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-5 text-gray-600 hover:text-black text-3xl"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {editingItem ? "Edit Item" : "Add Item"}
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="font-medium">Item Name</label>
                <input name="itemName" className="customInput" value={form.itemName} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">SKU</label>
                <input name="sku" className="customInput" value={form.sku} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Barcode</label>
                <input name="barcode" className="customInput" value={form.barcode} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Group</label>
                <select name="group" className="customSelect" value={form.group} onChange={handleInput}>
                  <option value="">Select Group</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Groceries">Groceries</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Unit</label>
                <select name="unit" className="customSelect" value={form.unit} onChange={handleInput}>
                  <option value="">Select Unit</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Kg">Kg</option>
                  <option value="Ltr">Ltr</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Purchase Price</label>
                <input type="number" name="purchasePrice" className="customInput" value={form.purchasePrice} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Selling Price</label>
                <input type="number" name="sellingPrice" className="customInput" value={form.sellingPrice} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">MRP</label>
                <input type="number" name="mrp" className="customInput" value={form.mrp} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Tax Scheme</label>
                <select name="taxScheme" className="customSelect" value={form.taxScheme} onChange={handleInput}>
                  <option value="">Select Tax Scheme</option>
                  <option value="GST 5%">GST 5%</option>
                  <option value="GST 12%">GST 12%</option>
                  <option value="GST 18%">GST 18%</option>
                  <option value="GST 28%">GST 28%</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Opening Stock</label>
                <input type="number" name="openingStock" className="customInput" value={form.openingStock} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Reorder Level</label>
                <input type="number" name="reorderLevel" className="customInput" value={form.reorderLevel} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Lead Time Days</label>
                <input type="number" name="leadTimeDays" className="customInput" value={form.leadTimeDays} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">HS Code</label>
                <input name="hsCode" className="customInput" value={form.hsCode} onChange={handleInput} />
              </div>

              <div className="col-span-2">
                <label className="font-medium">Description</label>
                <textarea name="description" className="customInput" value={form.description} onChange={handleInput} />
              </div>

              <div className="col-span-2">
                <label className="font-medium">Item Image</label>
                <input type="file" className="customInput" onChange={handleImageUpload} />
                {form.itemImage && (
                  <img src={form.itemImage} alt="Preview" className="mt-2 w-24 h-24 rounded border" />
                )}
              </div>

              <div className="col-span-2">
                <label className="font-medium">Status</label>
                <select name="status" className="customSelect" value={form.status} onChange={handleInput}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button onClick={handleSubmit} className="customBtn col-span-2">
                {editingItem ? "Update" : "Save"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemMaster;
