
import React from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookmarkButtonProps {
  onClick: () => void;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ onClick }) => {
  return (
    <Button variant="ghost" size="icon" className="text-white" onClick={onClick}>
      <Bookmark className="w-5 h-5" />
    </Button>
  );
};

export default BookmarkButton;
