import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Users, Coffee, Target, Video, ArrowLeft, MessageCircle } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ZoomMeeting from "@/components/zoom-meeting";
import { localDb } from "@/lib/localDb";

interface Message {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  room: string;
}

export default function Chat() {
  const [location, navigate] = useLocation();
  
  // Parse URL parameters for direct messages
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const chatWithUserId = urlParams.get('with');
  const chatWithUser = chatWithUserId ? localDb.getUser(chatWithUserId) : null;
  
  const [activeRoom, setActiveRoom] = useState(chatWithUserId ? `dm-${chatWithUserId}` : "coffee");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      user: "Mary_68",
      message: "Good morning everyone! Beautiful day today 🌞",
      timestamp: new Date(Date.now() - 300000),
      room: "coffee"
    },
    {
      id: "2", 
      user: "Jordan_16",
      message: "Hey Mary! Hope you're doing well. Any weekend plans?",
      timestamp: new Date(Date.now() - 240000),
      room: "coffee"
    },
    {
      id: "3",
      user: "TechGuru_55",
      message: "Does anyone know how to set up a smart TV? I'm totally lost!",
      timestamp: new Date(Date.now() - 180000),
      room: "tech-help"
    },
    // Add demo direct messages if chatting with someone specific
    ...(chatWithUser ? [
      {
        id: `dm-1-${chatWithUserId}`,
        user: chatWithUser.username,
        message: `Hi! I saw your skill swap request. I'd love to connect and share knowledge!`,
        timestamp: new Date(Date.now() - 120000),
        room: `dm-${chatWithUserId}`
      },
      {
        id: `dm-2-${chatWithUserId}`,
        user: "You",
        message: `Hello ${chatWithUser.first_name}! Great to meet you. What would you like to learn or teach?`,
        timestamp: new Date(Date.now() - 60000),
        room: `dm-${chatWithUserId}`
      }
    ] : [])
  ]);
  const [newMessage, setNewMessage] = useState("");

  const rooms = [
    { id: "coffee", name: "Coffee Room", icon: Coffee, color: "accent", activeUsers: 12 },
    { id: "tech-help", name: "Tech Help", icon: Target, color: "primary", activeUsers: 8 },
    { id: "creative", name: "Creative Arts", icon: Users, color: "secondary", activeUsers: 15 }
  ];

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        user: "You",
        message: newMessage,
        timestamp: new Date(),
        room: activeRoom
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const filteredMessages = messages.filter(msg => msg.room === activeRoom);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          {chatWithUser ? (
            <div>
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/chat')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Rooms
                </Button>
                <h1 className="font-arcade text-primary text-2xl md:text-4xl">
                  CHAT WITH {chatWithUser.username.toUpperCase()}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Direct message with {chatWithUser.first_name} {chatWithUser.last_name}
              </p>
            </div>
          ) : (
            <div>
              <h1 className="font-arcade text-primary text-3xl md:text-5xl mb-4">CONNECT & CHAT</h1>
              <p className="text-xl text-muted-foreground">Text chat and video meetings in one place</p>
            </div>
          )}
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="chat" className="arcade-button" data-testid="tab-chat">
              <Coffee className="w-4 h-4 mr-2" />
              Text Chat
            </TabsTrigger>
            <TabsTrigger value="video" className="arcade-button" data-testid="tab-video">
              <Video className="w-4 h-4 mr-2" />
              Video Meetings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            {chatWithUser ? (
              // Direct Message Interface
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <img
                        src={chatWithUser.profile_image_url || `https://avatar.iran.liara.run/public/boy?username=${chatWithUser.username}`}
                        alt={chatWithUser.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-arcade text-primary">
                          {chatWithUser.first_name} {chatWithUser.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">@{chatWithUser.username}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 flex flex-col">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-muted rounded-lg mb-4">
                        {filteredMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.user === 'You'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-card border'
                              }`}
                            >
                              <div className="text-sm">{msg.message}</div>
                              <div className="text-xs opacity-75 mt-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Message Input */}
                      <div className="flex space-x-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={`Message ${chatWithUser.first_name}...`}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} className="arcade-button">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Room-based Chat Interface
              <div className="grid lg:grid-cols-4 gap-6">
                {/* Room List */}
                <div className="lg:col-span-1">
                  <h2 className="font-arcade text-secondary text-lg mb-4">ROOMS</h2>
                  <div className="space-y-3">
                    {rooms.map((room) => {
                      const IconComponent = room.icon;
                      return (
                        <button
                          key={room.id}
                          onClick={() => setActiveRoom(room.id)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all arcade-button ${
                            activeRoom === room.id 
                              ? `border-${room.color} bg-${room.color} text-${room.color}-foreground` 
                              : 'border-border bg-card hover:border-primary'
                          }`}
                          data-testid={`button-room-${room.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-5 h-5" />
                            <div>
                              <div className="font-medium">{room.name}</div>
                              <div className="text-sm opacity-75">{room.activeUsers} active</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border h-96 flex flex-col">
              {/* Chat Header */}
              <div className="border-b p-4">
                <h3 className="font-arcade text-primary text-sm">
                  {rooms.find(r => r.id === activeRoom)?.name.toUpperCase()}
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3" data-testid="chat-messages">
                {filteredMessages.map((msg) => (
                  <div key={msg.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                      {msg.user[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{msg.user}</span>
                        <span className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-foreground">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t p-4 flex space-x-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button
                  onClick={sendMessage}
                  className="arcade-button bg-primary text-primary-foreground"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
            )}
          </TabsContent>

          <TabsContent value="video">
            <ZoomMeeting />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}