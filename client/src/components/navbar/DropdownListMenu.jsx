// src/components/navbar/DropdownListMenu.jsx
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlignLeft } from "lucide-react";
import { Button } from "../ui/button";
import UserIcon from "./UserIcon";
import { links } from "@/utils/links";
import { Link } from "react-router-dom";
import SignOutLink from "./SignOutLink";
import { useAuth } from "@/context/AuthContext";

const DropdownListMenu = () => {
  const { token } = useAuth();
  const isAuthed = !!token;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <AlignLeft />
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {links.map((item, i) => (
          <DropdownMenuItem key={i}>
            <Link to={item.href}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
        {!isAuthed ? (
          <>
            <DropdownMenuItem>
              <Link to="/login">Login</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/register">Register</Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem>
            <SignOutLink />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownListMenu;
