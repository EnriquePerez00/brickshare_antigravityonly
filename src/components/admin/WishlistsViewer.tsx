import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const WishlistsViewer = () => {
  const { data: wishlists, isLoading } = useQuery({
    queryKey: ["admin-wishlists"],
    queryFn: async () => {
      // Fetch wishlists with product details
      const { data: wishlistData, error: wishlistError } = await supabase
        .from("wishlist")
        .select(`
          id,
          user_id,
          created_at,
          products (
            id,
            name,
            theme,
            age_range
          )
        `)
        .order("created_at", { ascending: false });

      if (wishlistError) throw wishlistError;

      // Fetch profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name");

      if (profilesError) throw profilesError;

      // Create a map of user_id to full_name
      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, p.full_name]) || []
      );

      // Combine the data
      return wishlistData?.map((item) => ({
        ...item,
        user_name: profileMap.get(item.user_id) || "Unknown User",
      }));
    },
  });

  // Group wishlists by user
  const groupedWishlists = wishlists?.reduce((acc, item) => {
    if (!acc[item.user_id]) {
      acc[item.user_id] = {
        user_id: item.user_id,
        user_name: item.user_name,
        items: [],
      };
    }
    acc[item.user_id].items.push(item);
    return acc;
  }, {} as Record<string, { user_id: string; user_name: string; items: typeof wishlists }>);

  const groupedArray = groupedWishlists ? Object.values(groupedWishlists) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Wishlists</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : groupedArray.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No wishlists found.
          </p>
        ) : (
          <div className="space-y-6">
            {groupedArray.map((userWishlist) => (
              <div
                key={userWishlist.user_id}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold text-lg">
                    {userWishlist.user_name}
                  </h3>
                  <Badge variant="secondary">
                    {userWishlist.items.length} items
                  </Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Theme</TableHead>
                      <TableHead>Age Range</TableHead>
                      <TableHead>Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userWishlist.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.products?.name || "Unknown Product"}
                        </TableCell>
                        <TableCell>{item.products?.theme}</TableCell>
                        <TableCell>{item.products?.age_range}</TableCell>
                        <TableCell>
                          {format(new Date(item.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WishlistsViewer;
