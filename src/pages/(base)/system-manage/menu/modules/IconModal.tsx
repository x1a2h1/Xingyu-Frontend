import { useMemo, useState } from "react";
import { Input } from "antd";

import { ICON_LIST } from "../constants";

interface IconModalProps {
  isModalOpen: boolean;
  setIcon: (icon: string) => void;
  setIsModalOpen: (open: boolean) => void;
}

export const IconModal = ({
  isModalOpen,
  setIcon,
  setIsModalOpen,
}: IconModalProps) => {
  const [searchValue, setSearchValue] = useState("");

  // 过滤图标列表
  const filteredIcons = useMemo(() => {
    if (!searchValue) return ICON_LIST;
    return ICON_LIST.filter((icon: string) =>
      icon.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue]);

  const handleIconSelect = (icon: string) => {
    setIcon(icon);
    setIsModalOpen(false);
    setSearchValue(""); // 重置搜索
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSearchValue(""); // 重置搜索
  };

  return (
    <AModal
      footer={null}
      open={isModalOpen}
      title="请选择图标"
      width={600}
      onCancel={handleCancel}
    >
      <div className="mb-4">
        <Input
          allowClear
          placeholder="搜索图标..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-8 gap-2">
          {filteredIcons.map((icon: string) => (
            <div
              className="flex h-12 w-12 cursor-pointer flex-col items-center justify-center rounded-lg border transition-all hover:border-blue-300 hover:bg-blue-50"
              key={icon}
              title={icon}
              onClick={() => handleIconSelect(icon)}
            >
              <div className={`${icon} text-xl`} />
            </div>
          ))}
        </div>

        {filteredIcons.length === 0 && (
          <div className="py-8 text-center text-gray-500">未找到匹配的图标</div>
        )}
      </div>
    </AModal>
  );
};
