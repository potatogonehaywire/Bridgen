import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, Monitor, Users, Calendar, ExternalLink } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MeetingRoom {
  id: string;
  name: string;
  description: string;
  creator: {
    id: string;
    username: string;
  };
  zoom_meeting_id: string;
  zoom_join_url: string;
  scheduled_time: string | null;
  max_participants: number;
  is_active: boolean;
}

interface ZoomMeetingProps {
  onJoinMeeting?: (roomId: string) => void;
}

export default function ZoomMeeting({ onJoinMeeting }: ZoomMeetingProps) {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [simulateVideoCall, setSimulateVideoCall] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [currentRoom, setCurrentRoom] = useState<MeetingRoom | null>(null);
  const [roomForm, setRoomForm] = useState({
    name: "",
    description: "",
    scheduled_time: "",
    max_participants: 10
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch meeting rooms
  const { data: meetingRooms, isLoading } = useQuery({
    queryKey: ['/api/meeting-rooms']
  });

  // Create meeting room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (roomData: any) => {
      await apiRequest('POST', '/api/meeting-rooms', roomData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meeting-rooms'] });
      toast({
        title: "Meeting Room Created",
        description: "Your video meeting room is ready!",
      });
      setShowCreateRoom(false);
      setRoomForm({
        name: "",
        description: "",
        scheduled_time: "",
        max_participants: 10
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Join meeting mutation
  const joinMeetingMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await apiRequest('POST', `/api/meeting-rooms/${roomId}/join`, {});
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentRoom(data.room);
      // For demo purposes, we'll simulate joining the meeting
      setSimulateVideoCall(true);
      toast({
        title: "Joining Meeting",
        description: `Connecting to ${data.room.name}...`,
      });
      
      // In real implementation, this would integrate with Zoom SDK
      // For now, we'll just open the Zoom URL in a new tab
      if (data.zoom_join_url && data.zoom_join_url.includes('zoom.us')) {
        setTimeout(() => {
          window.open(data.zoom_join_url, '_blank');
        }, 1000);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateRoom = () => {
    if (!roomForm.name) {
      toast({
        title: "Error",
        description: "Room name is required",
        variant: "destructive",
      });
      return;
    }
    createRoomMutation.mutate(roomForm);
  };

  const handleJoinMeeting = (room: MeetingRoom) => {
    joinMeetingMutation.mutate(room.id);
    if (onJoinMeeting) {
      onJoinMeeting(room.id);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Instant Meeting';
    return new Date(dateString).toLocaleString();
  };

  const MockVideoCall = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video Call Header */}
      <div className="bg-gray-900 p-4 flex justify-between items-center">
        <div className="text-white">
          <h3 className="font-bold">{currentRoom?.name}</h3>
          <p className="text-sm text-gray-300">Meeting ID: {currentRoom?.zoom_meeting_id}</p>
        </div>
        <Button
          variant="destructive"
          onClick={() => {
            setSimulateVideoCall(false);
            setCurrentRoom(null);
          }}
          data-testid="button-leave-meeting"
        >
          Leave Meeting
        </Button>
      </div>

      {/* Video Area */}
      <div className="flex-1 bg-gray-800 flex items-center justify-center relative">
        <div className="grid grid-cols-2 gap-4 max-w-4xl w-full p-8">
          {/* Local Video */}
          <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center relative">
            {isVideoOn ? (
              <div className="text-white text-center">
                <Video className="w-16 h-16 mx-auto mb-2" />
                <p>Your Video</p>
              </div>
            ) : (
              <div className="text-white text-center">
                <VideoOff className="w-16 h-16 mx-auto mb-2" />
                <p>Video Off</p>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              You
            </div>
          </div>

          {/* Remote Video */}
          <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center relative">
            <div className="text-white text-center">
              <Users className="w-16 h-16 mx-auto mb-2" />
              <p>Waiting for others...</p>
            </div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              Other Participants
            </div>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-4 bg-gray-900 bg-opacity-80 p-4 rounded-lg">
            <Button
              variant={isAudioOn ? "default" : "destructive"}
              size="sm"
              onClick={() => setIsAudioOn(!isAudioOn)}
              data-testid="button-toggle-audio"
            >
              {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              variant={isVideoOn ? "default" : "destructive"}
              size="sm"
              onClick={() => setIsVideoOn(!isVideoOn)}
              data-testid="button-toggle-video"
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" data-testid="button-share-screen">
              <Monitor className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (simulateVideoCall) {
    return <MockVideoCall />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-arcade text-primary">Video Meeting Rooms</h2>
          <p className="text-muted-foreground">Connect face-to-face with learning partners</p>
        </div>
        <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
          <DialogTrigger asChild>
            <Button className="arcade-button" data-testid="button-create-room">
              <Video className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Video Meeting Room</DialogTitle>
              <DialogDescription>
                Set up a new video call room for mentoring or collaboration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  placeholder="e.g., Python Coding Session"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                  data-testid="input-room-name"
                />
              </div>
              <div>
                <Label htmlFor="room-description">Description</Label>
                <Textarea
                  id="room-description"
                  placeholder="What will you discuss in this meeting?"
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                  rows={3}
                  data-testid="textarea-room-description"
                />
              </div>
              <div>
                <Label htmlFor="scheduled-time">Scheduled Time (Optional)</Label>
                <Input
                  id="scheduled-time"
                  type="datetime-local"
                  value={roomForm.scheduled_time}
                  onChange={(e) => setRoomForm({...roomForm, scheduled_time: e.target.value})}
                  data-testid="input-scheduled-time"
                />
              </div>
              <div>
                <Label htmlFor="max-participants">Max Participants</Label>
                <Input
                  id="max-participants"
                  type="number"
                  min="2"
                  max="50"
                  value={roomForm.max_participants}
                  onChange={(e) => setRoomForm({...roomForm, max_participants: parseInt(e.target.value) || 10})}
                  data-testid="input-max-participants"
                />
              </div>
              <Button
                onClick={handleCreateRoom}
                disabled={createRoomMutation.isPending}
                className="w-full"
                data-testid="button-save-room"
              >
                Create Meeting Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meeting Rooms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="text-muted-foreground">Loading meeting rooms...</div>
          </div>
        ) : (
          meetingRooms?.map((room: MeetingRoom) => (
            <Card key={room.id} className="arcade-card border-arcade-blue">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{room.name}</span>
                  {room.is_active && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Created by {room.creator?.username}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {room.description && (
                  <p className="text-sm text-muted-foreground">{room.description}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateTime(room.scheduled_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Max {room.max_participants} participants</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleJoinMeeting(room)}
                    disabled={!room.is_active || joinMeetingMutation.isPending}
                    className="flex-1"
                    data-testid={`button-join-room-${room.id}`}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Meeting
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(room.zoom_join_url, '_blank')}
                    data-testid={`button-external-join-${room.id}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {(!meetingRooms || meetingRooms.length === 0) && !isLoading && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Meeting Rooms</h3>
          <p className="text-muted-foreground mb-4">
            Create your first video meeting room to start connecting with others!
          </p>
          <Button onClick={() => setShowCreateRoom(true)} data-testid="button-create-first-room">
            Create Your First Room
          </Button>
        </div>
      )}
    </div>
  );
}