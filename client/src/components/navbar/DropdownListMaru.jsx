import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlignLeft, TypeOutline } from "lucide-react";
import { Button } from "../ui/button";
import UserIcon from "./UserIcon";
import { links } from "@/utils/links";
import { Link } from "react-router";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import SignOutLink from "./SignOutLink";

const DropdownListMaru = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="Outline">
          <AlignLeft />
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {links.map((item, index) => {
          // console.log(item.href);
          return (
            <DropdownMenuItem key={index}>
              <Link to={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          );
        })}

        {/*กรณียังไม่ได้ login*/}

        {/* <SignedOut>
          <DropdownMenuItem>
            
            <SignInButton mode="modal">
              <button className="btn btn-primary">Login</button>
            </SignInButton>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <SignUpButton>
              <button className="btn btn-secondary">Register</button>
            </SignUpButton>
          </DropdownMenuItem>
        </SignedOut> */}

        {/* ใหม่: ลิงก์ไปเพจของเรา */}
        <SignedOut>
          <DropdownMenuItem>
            <Link to="/login">Login</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link to="/register">Register</Link>
          </DropdownMenuItem>
        </SignedOut>
        {/*กรณี login แล้ว*/}
        <SignedIn>
          <DropdownMenuItem>
            {/* <UserButton /> */}
            {/* <SignOutButton /> */}
            <SignOutLink />
          </DropdownMenuItem>
        </SignedIn>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownListMaru;
