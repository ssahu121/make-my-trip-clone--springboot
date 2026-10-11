import { useEffect, useState } from "react";
import SignupDialog from "./SignupDialog";
import {
  LogOut,
  Plane,
  User,
  Sparkles,
} from "lucide-react";
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
  const [mounted, setMounted] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    dispatch(clearUser());
    router.push("/");
  };

  const openRecommendations = () => {
    // Support both common user ID field names.
    const userId = user?.id || user?._id;

    if (!userId) {
      console.error("User ID not found in Redux user object:", user);
      return;
    }

    router.push(
      `/recommendations?userId=${encodeURIComponent(String(userId))}`
    );
  };

  return (
    <header className="sticky top-0 z-50 py-4 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <div
          className="flex cursor-pointer items-center space-x-2 text-white"
          onClick={() => router.push("/")}
        >
          <Plane className="h-8 w-8 text-red-500" />
          <span className="text-2xl font-bold text-black">
            MakeMyTour
          </span>
        </div>

        {/* User menu */}
        <div className="flex items-center space-x-4">
          {!mounted ? null : user ? (
            <>
              {user.role === "ADMIN" && (
                <Button
                  onClick={() => router.push("/admin")}
                  variant="default"
                >
                  ADMIN
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.firstName?.charAt(0) || (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-56"
                  align="end"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p>{user?.firstName || "My Account"}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>

                  {/* Personalized recommendations */}
                  <DropdownMenuItem
                    onClick={openRecommendations}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Recommendations
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

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
