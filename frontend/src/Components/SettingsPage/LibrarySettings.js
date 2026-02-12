import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { connect } from "react-redux";
import { startLibrarySync, clearSyncStats } from "../../Redux/Actions/uiActions";
import "./LibrarySettings.css";

function LibrarySettings({ isAdmin, syncLoading, syncStats, startLibrarySync, clearSyncStats }) {
  const [settings, setSettings] = useState({
    library_path: "",
    auto_scan_enabled: false,
    scan_interval: 60,
    organize_mode: false,
    allow_duplicates: false,
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get("/library/settings");
      setSettings(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/library/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await axios.put("/library/settings", settings);
      setMessage({ type: "success", text: "Settings saved successfully!" });
      fetchStats(); // Refresh stats after save
    } catch (error) {
      console.error("Error saving settings:", error);
      const errorMsg =
        (error.response && error.response.data && error.response.data.error) || "Failed to save settings";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const prevSyncLoading = useRef(syncLoading);

  useEffect(() => {
    if (!syncLoading && syncStats) {
      // Sync just finished and we have stats
      fetchStats();
      setMessage({
        type: "success",
        text: `Sync completed! ${syncStats.imported} files imported, ${syncStats.missing} missing, ${syncStats.updated} updated.`,
      });
      clearSyncStats();
    }
    prevSyncLoading.current = syncLoading;
  }, [syncLoading, syncStats]);

  const handleSync = () => {
    setMessage(null);
    startLibrarySync();
    setMessage({
      type: "success",
      text: "Library sync started! This may take a few minutes.",
    });
  };

  if (loading) {
    return <div className="library-settings-loading">Loading settings...</div>;
  }

  return (
    <div className="library-settings">
      <h2>Library Settings</h2>

      {message && (
        <div className={`library-message library-message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Library Statistics */}
      {stats && (
        <div className="library-stats">
          <h3>Library Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Sheets:</span>
              <span className="stat-value">{stats.total_sheets}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Synced Sheets:</span>
              <span className="stat-value">{stats.synced_sheets}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Uploaded Sheets:</span>
              <span className="stat-value">{stats.uploaded_sheets}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unavailable Sheets:</span>
              <span className="stat-value">{stats.unavailable_sheets}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Composers:</span>
              <span className="stat-value">{stats.total_composers}</span>
            </div>
          </div>
        </div>
      )}

      {/* Manual Sync Button (available to all users) */}
      <div className="sync-section">
        <button
          onClick={handleSync}
          disabled={syncLoading}
          className="btn-sync"
        >
          {syncLoading ? "Syncing..." : "Sync Library Now"}
        </button>
      </div>

      {/* Settings Form (admin only) */}
      {isAdmin ? (
        <div className="settings-form">
          <h3>Configuration</h3>

          <div className="form-group">
            <label htmlFor="library_path">Library Path</label>
            <input
              type="text"
              id="library_path"
              name="library_path"
              value={settings.library_path}
              onChange={handleInputChange}
              placeholder="/sheetmusic"
            />
            <small>Absolute path to your sheet music directory (e.g. /sheetmusic in Docker)</small>
          </div>

          <div className="form-group">
            <label htmlFor="scan_interval">Scan Interval (minutes)</label>
            <input
              type="number"
              id="scan_interval"
              name="scan_interval"
              value={settings.scan_interval}
              onChange={handleInputChange}
              min="1"
            />
            <small>How often to automatically scan for new files</small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="auto_scan_enabled"
                checked={settings.auto_scan_enabled}
                onChange={handleInputChange}
              />
              <span>Enable Auto-Scan</span>
            </label>
            <small>Automatically scan library at regular intervals</small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="organize_mode"
                checked={settings.organize_mode}
                onChange={handleInputChange}
              />
              <span>Organize Mode</span>
            </label>
            <small>Create organized symlinks by composer</small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="allow_duplicates"
                checked={settings.allow_duplicates}
                onChange={handleInputChange}
              />
              <span>Allow Duplicates</span>
            </label>
            <small>Allow importing duplicate files (same hash)</small>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-save"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      ) : (
        <div className="non-admin-notice">
          <p>You do not have permission to modify library settings.</p>
          <p>Contact an administrator to change these settings.</p>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  syncLoading: state.UI.syncLoading,
  syncStats: state.UI.syncStats,
});

const mapActionsToProps = {
  startLibrarySync,
  clearSyncStats,
};

export default connect(mapStateToProps, mapActionsToProps)(LibrarySettings);
