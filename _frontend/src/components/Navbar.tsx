import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const handleRetrieve = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/${keyword.trim()}`);
      setKeyword("");
    }
  };

  return (
    <nav className="w-full bg-background/80 border-b border-primary/10 shadow-sm sticky top-0 z-30 backdrop-blur">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2">
        <Link to="/" className="font-bold text-xl gradient-primary bg-clip-text text-transparent">
          ShareAny
        </Link>
        <form onSubmit={handleRetrieve} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Enter keyword..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-36 md:w-48"
          />
          <Button type="submit" variant="outline">
            Retrieve
          </Button>
        </form>
        <div className="hidden md:flex gap-4">
          <Link to="/" className={`hover:underline ${location.pathname === "/" ? "font-semibold" : ""}`}>Upload</Link>
          <Link to="/view/demo" className="hover:underline">Demo</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
