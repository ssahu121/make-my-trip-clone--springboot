"use client";
import { useEffect, useState } from "react";
import SignupDialog from "./SignupDialog";
import { LogOut, Plane, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { clearUser } from "@/store";
import { useRouter } from "next/navigation";

const Navbar = () => {
  // ✅ ALL hooks top pe (perfect)
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("user"); // ✅ add this
    dispatch(clearUser());
    router.push("/");
  };

  return (
    <header className="backdrop-blur-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 text-white">
          <Plane className="w-8 h-8 text-red-500" />
          <span className="text-2xl font-bold text-black">MakeMyTour</span>
        </div>

        {/* ✅ mounted check yaha use karo */}
        <div className="flex items-center space-x-4">
          {!mounted ? null : user ? (
            <>
              {user.role === "ADMIN" && (
                <Button onClick={() => router.push("/admin")} variant="default">
                  ADMIN
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.firstName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p>{user?.firstName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <SignupDialog
              trigger={
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Sign Up
                </Button>
              }
            />
          )} 
        </div>
      </div>
    </header>
  );
};

export default Navbar;
