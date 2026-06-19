import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Message from "../components/Message";
import "./Chat.css";

function Chat() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || "";

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [profilePic, setProfilePic] = useState(
    currentUser?.profilePic || ""
  );

  const [recentChats, setRecentChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  const loadRecentChats = useCallback(async () => {
    if (!currentUser) return;
    setLoadingChats(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/messages/recent/${currentUser._id}`
      );
      if (!res.ok) {
        throw new Error("Failed to load recent chats");
      }
      const data = await res.json();
      setRecentChats(data);
    } catch (err) {
      console.error("Error loading recent chats:", err);
    } finally {
      setLoadingChats(false);
    }
  }, [API_BASE, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchChats = async () => {
      await loadRecentChats();
    };

    fetchChats();
  }, [currentUser, navigate, loadRecentChats]);

  const fetchMessages = async (userId, otherId, showLoading = true) => {
    if (!userId || !otherId) return;
    if (showLoading) {
      setLoadingMessages(true);
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/messages/${userId}/${otherId}`
      );

      if (!res.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      if (showLoading) {
        setLoadingMessages(false);
      }
    }
  };

  const loadMessages = async (user) => {
    setSelectedUser(user);
    await fetchMessages(currentUser._id, user._id);
    await loadRecentChats();
  };

  const searchUsers = async (query) => {
    setSearchTerm(query);
    if (!currentUser) return [];

    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    try {
      const res = await fetch(`${API_BASE}/api/users`);
      if (!res.ok) {
        throw new Error("Search failed");
      }

      const allUsers = await res.json();
      const normalizedQuery = query.trim().toLowerCase();

      const filtered = allUsers
        .filter((user) => user._id !== currentUser._id)
        .map((user) => ({
          _id: user._id,
          username: user.username || user.name || "",
          email: user.email || "",
          profilePic: user.profilePic || "",
        }))
        .filter((user) => {
          const username = (user.username || "").toLowerCase();
          const email = (user.email || "").toLowerCase();
          return (
            username.includes(normalizedQuery) ||
            email.includes(normalizedQuery)
          );
        });

      setSearchResults(filtered);
      return filtered;
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
      return [];
    }
  };

  const handleSearchSubmit = async () => {
    const results = await searchUsers(searchTerm);
    if (results.length === 1) {
      await loadMessages(results[0]);
    } else {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const exactMatch = results.find((user) => {
        const email = (user.email || "").toLowerCase();
        const username = (user.username || "").toLowerCase();
        return (
          email === normalizedSearch ||
          username === normalizedSearch
        );
      });
      if (exactMatch) {
        await loadMessages(exactMatch);
      }
    }
  };

  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const poll = setInterval(() => {
      fetchMessages(currentUser._id, selectedUser._id, false);
    }, 3000);

    return () => clearInterval(poll);
  }, [currentUser, selectedUser]);

  const sendMessage = async () => {
    if ((!message.trim() && !attachment) || !selectedUser) return;

    const payload = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      text: message || "",
      attachment: attachment
        ? {
            type: attachment.type,
            url: attachment.url,
            name: attachment.name,
          }
        : null,
    };

    try {
      console.log("Sending message payload:", payload);
      const response = await fetch(
        `${API_BASE}/api/messages/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(result?.message || "Failed to send message");
      }

      if (result?.messageObj) {
        setMessages((prev) => [...prev, result.messageObj]);
      } else {
        await fetchMessages(currentUser._id, selectedUser._id);
      }

      setMessage("");
      setAttachment(null);
    } catch (error) {
      console.error("Error sending message:", error);
      alert(error.message || "Failed to send message.");
    } finally {
      setAttachmentLoading(false);
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !currentUser?._id) {
      return;
    }

    console.log(
      "Selected image size:",
      (file.size / 1024 / 1024).toFixed(2),
      "MB"
    );

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const imageUrl = reader.result;

        const response = await fetch(
          `${API_BASE}/api/users/${currentUser._id}/profile-picture`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profilePic: imageUrl,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to save profile picture."
          );
        }

        setProfilePic(data.profilePic);

        const updatedUser = {
          ...currentUser,
          profilePic: data.profilePic,
        };

        setCurrentUser(updatedUser);

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        alert(
          "Profile picture updated successfully!"
        );
      } catch (error) {
        console.error(
          "Profile picture upload error:",
          error
        );
        alert(error.message);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleAttachmentChange = (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert("Please select a file smaller than 25 MB.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    setAttachmentLoading(true);
    reader.onload = () => {
      setAttachment({
        type: file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "other",
        url: reader.result,
        name: file.name,
      });
      setAttachmentLoading(false);
      input.value = "";
    };
    reader.onerror = () => {
      alert("Unable to read selected file. Please try another file.");
      setAttachmentLoading(false);
      input.value = "";
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => setAttachment(null);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="chat-container">
      <Sidebar
        currentUser={currentUser}
        profilePic={profilePic}
        recentChats={recentChats}
        searchTerm={searchTerm}
        searchResults={searchResults}
        selectedUser={selectedUser}
        loadingChats={loadingChats}
        onSelectUser={loadMessages}
        onSearchChange={searchUsers}
        onSearchSubmit={handleSearchSubmit}
        onProfilePictureChange={handleProfilePictureChange}
        onLogout={handleLogout}
      />

      <div className="chat-area">
        {selectedUser ? (
          loadingMessages ? (
            <div className="chat-loading-skeleton">
              <div className="chat-skeleton-header skeleton" />
              <div className="chat-skeleton-messages">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className={`chat-skeleton-bubble skeleton ${
                      index % 2 ? "right" : "left"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-recipient">
                  <div className="avatar avatar-small">
                    {selectedUser.profilePic ? (
                      <img
                        src={selectedUser.profilePic}
                        alt={selectedUser.username}
                      />
                    ) : (
                      selectedUser.username
                        ?.charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <div>
                    <h3>{selectedUser.username}</h3>
                    <p>
                      Chat with {selectedUser.username}
                    </p>
                  </div>
                </div>

                <span className="chat-tag">Online</span>
              </div>

              <div className="messages">
                {Array.isArray(messages) &&
                  messages.map((msg, index) => {
                    const isOwnMessage =
                      msg?.sender === currentUser?._id;

                    const senderName = isOwnMessage
                      ? currentUser.username
                      : selectedUser?.username || "Unknown";

                    const senderAvatar = isOwnMessage
                      ? profilePic
                      : selectedUser?.profilePic || "";

                    return (
                      <Message
                        key={index}
                        msg={msg}
                        isOwnMessage={isOwnMessage}
                        senderName={senderName}
                        senderAvatar={senderAvatar}
                      />
                    );
                  })}
              </div>

              <div className="message-input">
                <label className="attachment-upload-button">
                  <input
                    type="file"
                    onChange={handleAttachmentChange}
                  />
                  + Attach
                </label>

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && sendMessage()
                  }
                />

                <button
                  onClick={sendMessage}
                  disabled={attachmentLoading}
                >
                  {attachmentLoading ? "Preparing..." : "Send"}
                </button>
              </div>

              {attachment && (
                <div className="attachment-preview">
                  {attachment.type === "video" ? (
                    <video controls src={attachment.url} />
                  ) : attachment.type === "image" ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                    />
                  ) : (
                    <div className="attachment-file-preview">
                      <span>{attachment.name}</span>
                    </div>
                  )}
                  <button
                    className="remove-attachment"
                    type="button"
                    onClick={removeAttachment}
                  >
                    Remove
                  </button>
                </div>
              )}
            </>
          )
        ) : (
          <div className="empty-chat">
            <div>
              <h2>Choose a contact to begin.</h2>
              <p>Your recent conversations appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;