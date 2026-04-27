"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  title: string;
};

export default function AdminHeader({ title }: Props) {
  return (
    <header className="h-14 border-b border-gray-100 px-6 flex items-center justify-between bg-white shrink-0">
      <h1 className="font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="relative p-1.5 text-gray-400 hover:text-gray-600">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-neutral-900 text-white">A</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700 hidden md:block">Admin</span>
        </div>
      </div>
    </header>
  );
}
