import { ArrowRightCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import useHooks from "./hooks";

function App() {
  const { mouseLocation, handleFlyToTokyo } = useHooks();

  // This is a simple example of a UI from ShadCN
  // https://ui.shadcn.com/blocks
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello world</CardTitle>
        <CardDescription>
          Lipsum dolor sit amet, consectetur adipiscing elit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]" />
              <TableHead>Longitude</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Height</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold">Mouse</TableCell>
              <TableCell>
                <Label htmlFor="mouse-lng" className="sr-only">
                  Longitude
                </Label>
                <Input
                  id="mouse-lng"
                  type="number"
                  disabled
                  value={mouseLocation.lng}
                />
              </TableCell>
              <TableCell>
                <Label htmlFor="mouse-lat" className="sr-only">
                  Latitude
                </Label>
                <Input
                  id="mouse-lat"
                  type="number"
                  disabled
                  value={mouseLocation.lat}
                />
              </TableCell>
              <TableCell>
                <Label htmlFor="mouse-height" className="sr-only">
                  Height
                </Label>
                <Input
                  id="mouse-height"
                  type="number"
                  disabled
                  value={mouseLocation.height}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-center p-4 border-t">
        <Button size="sm" className="gap-1" onClick={handleFlyToTokyo}>
          <ArrowRightCircle className="w-5 h-5" />
          Fly to Tokyo
        </Button>
      </CardFooter>
    </Card>
  );
}

export default App;
