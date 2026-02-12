import { useLeagueStandings, triggerLeagueUpdate } from "@/hooks/useLeagueStandings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function LeagueTable() {
  const { data: standings, isLoading, error, refetch } = useLeagueStandings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await triggerLeagueUpdate();
      await refetch();
      toast({
        title: "Success",
        description: "League standings updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update league standings",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>טבלה</CardTitle>
          <CardDescription>Loading league standings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle>טבלה</CardTitle>
          <CardDescription className="text-destructive">
            Failed to load league standings
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>טבלה</CardTitle>
          <CardDescription>
            {standings?.length ? `${"עודכן לאחרונה"}: ${new Date(standings[0]?.updatedAt).toLocaleDateString("he-IL")}` : "No data"}
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Updating..." : "Update"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">מיקום</TableHead>
                <TableHead className="text-right">קבוצה</TableHead>
                <TableHead className="text-center">מש׳</TableHead>
                <TableHead className="text-center">ניצ׳</TableHead>
                <TableHead className="text-center">הפ׳</TableHead>
                <TableHead className="text-center">נק׳</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings?.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-bold text-primary">{team.position}</TableCell>
                  <TableCell className="text-right font-medium">{team.name}</TableCell>
                  <TableCell className="text-center">{team.gamesPlayed}</TableCell>
                  <TableCell className="text-center text-emerald-500 font-semibold">{team.wins}</TableCell>
                  <TableCell className="text-center text-red-500 font-semibold">{team.losses}</TableCell>
                  <TableCell className="text-center font-bold">{team.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
