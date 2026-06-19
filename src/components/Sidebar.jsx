function Sidebar({
  currentUser,
  profilePic,
  recentChats,
  searchTerm,
  searchResults,
  selectedUser,
  loadingChats,
  onSelectUser,
  onProfilePictureChange,
  onSearchChange,
  onSearchSubmit,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="profile-box">
          <div className="avatar avatar-large">
            {profilePic ? (
              <img src={profilePic} alt="Profile" />
            ) : (
              currentUser?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2>{currentUser?.username || "Guest"}</h2>
            <p>{currentUser?.email || "No email"}</p>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          <span className="logout-icon">⏻</span>
          Sign out
        </button>

        <label className="profile-upload">
          <input
            type="file"
            accept="image/*"
            onChange={onProfilePictureChange}
          />
          Upload photo
        </label>
      </div>

      <div className="sidebar-search">
        <input
          type="search"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSearchSubmit?.();
            }
          }}
        />
      </div>

      <div className="user-list">
        {loadingChats ? (
          <div className="sidebar-skeleton">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="sidebar-skeleton-item">
                <div className="sidebar-skeleton-avatar skeleton" />
                <div className="sidebar-skeleton-lines">
                  <div className="sidebar-skeleton-line skeleton" />
                  <div className="sidebar-skeleton-line skeleton short" />
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          searchResults.length > 0 ? (
            searchResults.map((user) => (
              <button
                key={user._id}
                type="button"
                className={`user-item ${
                  selectedUser?._id === user._id ? "active" : ""
                }`}
                onClick={() => onSelectUser(user)}
              >
                <div className="avatar">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.username} />
                  ) : (
                    user.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="user-meta">
                  <h4>{user.username}</h4>
                  <small>{user.email}</small>
                </div>
              </button>
            ))
          ) : (
            <div className="sidebar-empty">No users found.</div>
          )
        ) : recentChats.length > 0 ? (
          recentChats.map((user) => (
            <button
              key={user._id}
              type="button"
              className={`user-item ${
                selectedUser?._id === user._id ? "active" : ""
              }`}
              onClick={() => onSelectUser(user)}
            >
              <div className="avatar">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.username} />
                ) : (
                  user.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="user-meta">
                <h4>{user.username}</h4>
                <small>{user.lastMessage || user.email}</small>
              </div>
            </button>
          ))
        ) : (
          <div className="sidebar-empty">No recent chats yet.</div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
