import { useEffect, useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";
import apiClient from "../../../api/apiClient";

interface ProfitDistribution {
  id: number;
  pos_percentage: number;
  service_percentage: number;
  mlm_percentage: number;
  company_percentage: number;
}

interface MLMSettings {
  id: number;
  minimum_sale_amount: number;
}

interface POSProfitSettings {
  walk_in_toggle: boolean;
  mode: string;
  description: string;
}

const ProfitDistributionSetup = () => {
  const [data, setData] = useState<ProfitDistribution[]>([]);
  const [settings, setSettings] = useState<MLMSettings | null>(null);
  const [posSettings, setPosSettings] = useState<POSProfitSettings | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProfitDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [posToggleLoading, setPosToggleLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await apiClient.get("mlm/profit-distribution/");
      if (res.data && res.data.id) {
        setData([res.data]);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(error);
      setData([]);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get("mlm/settings/");
      setSettings(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPOSSettings = async () => {
    try {
      const res = await apiClient.get("pos/pos-profit-settings/");
      setPosSettings(res.data);
    } catch (error) {
      console.error(error);
      setPosSettings({
        walk_in_toggle: true,
        mode: "walk_in_simple",
        description: "Walk-in mode ON - 90% Branch, 10% Company",
      });
    }
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
    fetchPOSSettings();
  }, []);

  const handleToggleChange = async (checked: boolean) => {
    setPosToggleLoading(true);
    try {
      const res = await apiClient.post("pos/pos-profit-settings/", {
        walk_in_toggle: checked,
      });
      if (res.data.success) {
        setPosSettings(res.data);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: checked 
            ? "Walk-in Mode ON - 90% Branch, 10% Company" 
            : "Walk-in Mode OFF - Using ProfitDistribution config",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to update POS settings",
        "error"
      );
    } finally {
      setPosToggleLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      pos_percentage: editingItem?.pos_percentage || 0,
      service_percentage: editingItem?.service_percentage || 0,
      mlm_percentage: editingItem?.mlm_percentage || 0,
      company_percentage: editingItem?.company_percentage || 0,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      pos_percentage: Yup.number().required("Required").min(0).max(100),
      service_percentage: Yup.number().required("Required").min(0).max(100),
      mlm_percentage: Yup.number().required("Required").min(0).max(100),
      company_percentage: Yup.number().required("Required").min(0).max(100),
    }),
    onSubmit: async (values) => {
      const total =
        values.pos_percentage +
        values.service_percentage +
        values.mlm_percentage +
        values.company_percentage;
      if (total !== 100) {
        Swal.fire("Error", "Total percentage must equal 100%", "error");
        return;
      }
      setIsLoading(true);
      try {
        if (editingItem) {
          await apiClient.put("mlm/profit-distribution/update/", values);
          Swal.fire("Updated!", "Distribution updated", "success");
        } else {
          await apiClient.post("mlm/profit-distribution/create/", values);
          Swal.fire("Created!", "Distribution created", "success");
        }
        fetchData();
        setModalOpen(false);
        setEditingItem(null);
        formik.resetForm();
      } catch (error: any) {
        Swal.fire(
          "Error",
          error?.response?.data?.error || "Something went wrong",
          "error"
        );
      }
      setIsLoading(false);
    },
  });

  const updateMinimumSale = async () => {
    if (!settings) return;
    setSettingsLoading(true);
    try {
      await apiClient.put("mlm/settings/update/", {
        minimum_sale_amount: settings.minimum_sale_amount,
      });
      Swal.fire("Updated!", "Minimum sale amount updated", "success");
      fetchSettings();
    } catch (error) {
      Swal.fire("Error", "Failed to update minimum sale", "error");
    }
    setSettingsLoading(false);
  };

  const handleEdit = (item: ProfitDistribution) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-blue-600">🏪</span> POS Profit Mode
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Control how POS sales profit is distributed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                posSettings?.walk_in_toggle
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {posSettings?.walk_in_toggle ? "Walk-in Mode ON" : "MLM Mode ON"}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={posSettings?.walk_in_toggle ?? true}
                onChange={(e) => handleToggleChange(e.target.checked)}
                disabled={posToggleLoading}
              />
              <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${posSettings?.walk_in_toggle ? "peer-checked:bg-emerald-500" : "peer-checked:bg-blue-500"} ${posToggleLoading ? "opacity-50" : ""}`}></div>
            </label>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-start gap-3">
            <div
              className={`w-2 h-2 rounded-full mt-1.5 ${
                posSettings?.walk_in_toggle ? "bg-emerald-500" : "bg-blue-500"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-slate-700">
                {posSettings?.walk_in_toggle ? (
                  <>
                    <span className="text-emerald-600 font-bold">Walk-in Mode</span>
                    {" — 90% Branch, 10% Company"}
                  </>
                ) : (
                  <>
                    <span className="text-blue-600 font-bold">MLM Distribution Mode</span>
                    {" — Using ProfitDistribution config"}
                  </>
                )}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {posSettings?.walk_in_toggle
                  ? "Simple split: Branch 90%, Company 10% (No MLM chain)"
                  : "ProfitDistribution config: POS %, MLM %, Service %, Company %"}
              </p>
            </div>
          </div>
        </div>
        {posToggleLoading && (
          <div className="mt-3 text-xs text-blue-500 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Updating mode...
          </div>
        )}
      </div>

      <DataTable<ProfitDistribution>
        data={data}
        columns={[
          { key: "id", label: "ID" },
          {
            key: "pos_percentage",
            label: "POS %",
            render: (item) => `${item.pos_percentage}%`,
          },
          {
            key: "service_percentage",
            label: "Service %",
            render: (item) => `${item.service_percentage}%`,
          },
          {
            key: "mlm_percentage",
            label: "MLM %",
            render: (item) => `${item.mlm_percentage}%`,
          },
          {
            key: "company_percentage",
            label: "Company %",
            render: (item) => `${item.company_percentage}%`,
          },
        ]}
        onAdd={() => {
          setEditingItem(null);
          setModalOpen(true);
        }}
        onEdit={handleEdit}
        addButtonLabel={data.length === 0 ? "Add Distribution" : undefined}
        title="Profit Distribution Management"
      />

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">Agent Activation Settings</h2>
        <div className="flex gap-4 items-center">
          <input
            type="number"
            value={settings?.minimum_sale_amount || 0}
            onChange={(e) =>
              setSettings({
                ...settings!,
                minimum_sale_amount: Number(e.target.value),
              })
            }
            className="w-[200px] px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition outline-none"
            placeholder="Minimum Sale"
          />
          <button
            onClick={updateMinimumSale}
            disabled={settingsLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {settingsLoading ? "Saving..." : "Update"}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Agent will become active after completing this minimum sale.
        </p>
        <p className="text-xs text-blue-500 mt-1">
          POS agents are always active (no minimum sale required)
        </p>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0000007d] z-50">
          <div className="bg-white p-6 rounded-lg w-[420px] relative">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? "Edit Distribution" : "Add Distribution"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-3">
              <input
                type="number"
                name="pos_percentage"
                placeholder="POS %"
                value={formik.values.pos_percentage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition outline-none"
              />
              <input
                type="number"
                name="service_percentage"
                placeholder="Service %"
                value={formik.values.service_percentage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition outline-none"
              />
              <input
                type="number"
                name="mlm_percentage"
                placeholder="MLM %"
                value={formik.values.mlm_percentage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition outline-none"
              />
              <input
                type="number"
                name="company_percentage"
                placeholder="Company %"
                value={formik.values.company_percentage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition outline-none"
              />
              <div className="text-xs text-slate-400 mt-1">
                Total:{" "}
                <span
                  className={`font-bold ${
                    formik.values.pos_percentage +
                      formik.values.service_percentage +
                      formik.values.mlm_percentage +
                      formik.values.company_percentage ===
                    100
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {formik.values.pos_percentage +
                    formik.values.service_percentage +
                    formik.values.mlm_percentage +
                    formik.values.company_percentage}
                  %
                </span>
                {formik.values.pos_percentage +
                  formik.values.service_percentage +
                  formik.values.mlm_percentage +
                  formik.values.company_percentage !==
                  100 && (
                  <span className="text-red-500 ml-2">(Must equal 100%)</span>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {isLoading ? "Processing..." : editingItem ? "Update" : "Add"}
                </button>
              </div>
            </form>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-xl hover:text-slate-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitDistributionSetup;