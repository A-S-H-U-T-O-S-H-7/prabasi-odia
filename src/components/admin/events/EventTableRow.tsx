"use client";

import { Users, Edit, Trash2, Eye, Calendar, MapPin } from "lucide-react";
import { Event } from "@/lib/services/adminEventService";

interface EventTableRowProps {
  event: Event;
  index: number;
  onViewAttendees: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export default function EventTableRow({
  event,
  index,
  onViewAttendees,
  onEdit,
  onDelete,
}: EventTableRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200">📅 Upcoming</span>;
      case 'ongoing':
        return <span className="px-2.5 py-1 bg-[#D9772B]/10 text-[#D9772B] text-xs font-medium rounded-full border border-[#D9772B]/20">🔄 Ongoing</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">✅ Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200">❌ Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  return (
    <tr className={`transition-colors ${index % 2 === 0 ? "bg-white/50" : "bg-[#FFF9F2]/50"} hover:bg-[#6B1E5B]/5`}>
      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{index + 1}</span>
      </td>
      
      <td className="px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-[#2A1636]">{event.title}</div>
          <div className="text-xs text-[#6B5E5A] flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {event.location}, {event.city}
          </div>
        </div>
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-[#6B5E5A]">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(event.date)}</span>
        </div>
      </td>
      
      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{event.communityName || '—'}</span>
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-[#6B5E5A]">
          <Users className="w-4 h-4" />
          <span>{event.attendeeCount || 0}</span>
        </div>
      </td>
      
      <td className="px-4 py-3">
        {getStatusBadge(event.status)}
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewAttendees(event)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="View Attendees"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(event)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-amber-100 text-amber-600 hover:bg-amber-200"
            title="Edit Event"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete Event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}