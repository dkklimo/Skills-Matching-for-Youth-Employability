import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AdminNotifications = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientRole, setRecipientRole] = useState<string>("all");
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    if (!title || !message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    const { error } = await supabase.from("notifications").insert({
      title,
      message,
      recipient_role: recipientRole === "all" ? null : recipientRole,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
      setTitle("");
      setMessage("");
      setRecipientRole("all");
    }
    setSending(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <CardTitle>Send Notifications</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              placeholder="Enter notification title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>
          <div>
            <Label htmlFor="recipient">Recipients</Label>
            <Select value={recipientRole} onValueChange={setRecipientRole}>
              <SelectTrigger id="recipient">
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="student">Students Only</SelectItem>
                <SelectItem value="educator">Educators Only</SelectItem>
                <SelectItem value="employer">Employers Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleSendNotification}
            disabled={sending}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Sending..." : "Send Notification"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};