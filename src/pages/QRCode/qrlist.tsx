import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable";
import QRCardModal from "./QRCardModal";
import apiClient from "../../api/apiClient";

interface QRCard {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  qr_image?: string;
  map_link?: string;
  whatsapp_link?: string;
  google_review_link?: string;
  instagram_link?: string;
  facebook_link?: string;
  youtube_link?: string;
  website_link?: string;
}

const QRCardList: React.FC = () => {
  const [cards, setCards] = useState<QRCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<QRCard | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("ecommerce/qrcards/");
      setCards(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "QR cards could not load", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleDownload = (item: QRCard) => {
    if (!item.qr_image) {
      Swal.fire("Error", "No QR image found", "error");
      return;
    }
    const link = document.createElement("a");
    link.href = item.qr_image;
    link.download = `${item.slug}_qr.png`;
    link.target = "_blank";
    link.click();
  };

  const handleEdit = (item: QRCard) => {
    setEditData(item);
    setModalOpen(true);
  };

  const handleDelete = async (item: QRCard) => {
    const result = await Swal.fire({
      title: "are you sure?",
      text: `"${item.name}" QR card delete `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`ecommerce/qrcards/${item.id}/`);
      Swal.fire("Deleted", "QR code deleted", "success");
      fetchCards();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not Delete ", "error");
    }
  };

  const columns = [
    {
      key: "logo",
      label: "Logo",
      render: (item: QRCard) =>
        item.logo ? (
          <img
            src={item.logo}
            alt={item.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200" />
        ),
    },
    { key: "name", label: "Name" },
    {
      key: "qr_image",
      label: "Generated QR",
      render: (item: QRCard) =>
        item.qr_image ? (
          <img src={item.qr_image} alt="qr" className="w-12 h-12 object-contain" />
        ) : (
          "—"
        ),
    },
  ];

  return (
    <>
      <DataTable<QRCard>
        title="QR Codes"
        data={cards}
        columns={columns}
        loading={loading}
        onAdd={() => {
          setEditData(null);
          setModalOpen(true);
        }}
        addButtonLabel="Add QR"
        onDownload={handleDownload}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={fetchCards}
        emptyMessage="No Qr found"
      />

      <QRCardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchCards}
        editData={editData}
      />
    </>
  );
};

export default QRCardList;