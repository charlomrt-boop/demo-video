import React from "react";
import { colors, font } from "../theme";

type Comment = {
  name: string;
  title: string;
  text: string;
  avatarHue: number;
};

export const LinkedInPost: React.FC<{
  author: { name: string; title: string; avatarHue: number };
  postText: string;
  stats: { reactions: number; comments: number; reposts: number };
  visibleComments: number;
  comments: Comment[];
}> = ({ author, postText, stats, visibleComments, comments }) => {
  return (
    <div
      style={{
        padding: "22px 28px",
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: font.body,
        color: "#1D1D1D",
      }}
    >
      {/* Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "18px 22px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        {/* Author */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: `linear-gradient(135deg, hsl(${author.avatarHue},70%,55%), hsl(${author.avatarHue + 40},70%,45%))`,
            }}
          />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
              {author.name}
            </div>
            <div style={{ fontSize: 12, color: "#5E5E5E", lineHeight: 1.3 }}>
              {author.title}
            </div>
            <div style={{ fontSize: 11, color: "#777", marginTop: 1 }}>
              2 h · 🌐
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              color: "#0A66C2",
              fontSize: 13,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 999,
              border: `1.5px solid #0A66C2`,
            }}
          >
            + Suivre
          </div>
        </div>

        {/* Post text */}
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.45,
            whiteSpace: "pre-line",
            marginBottom: 14,
          }}
        >
          {postText}
        </div>

        {/* Stats */}
        <div
          style={{
            fontSize: 12,
            color: "#5E5E5E",
            display: "flex",
            alignItems: "center",
            gap: 4,
            paddingTop: 10,
            borderTop: "1px solid #EBEBEB",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              marginRight: 4,
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#0A66C2",
                display: "inline-block",
                marginRight: -4,
                border: "2px solid #fff",
              }}
            />
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#D93025",
                display: "inline-block",
                marginRight: -4,
                border: "2px solid #fff",
              }}
            />
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#F5B400",
                display: "inline-block",
                border: "2px solid #fff",
              }}
            />
          </span>
          <span style={{ fontWeight: 500 }}>{stats.reactions}</span>
          <span style={{ marginLeft: "auto" }}>{stats.comments} commentaires · {stats.reposts} reposts</span>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: 6,
            padding: "6px 0",
            borderTop: "1px solid #EBEBEB",
            color: "#5E5E5E",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span>👍 J'aime</span>
          <span>💬 Commenter</span>
          <span>🔁 Republier</span>
          <span>📤 Envoyer</span>
        </div>
      </div>

      {/* Comments */}
      <div style={{ marginTop: 12 }}>
        {comments.slice(0, visibleComments).map((c, i) => (
          <div
            key={c.name}
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 8,
              display: "flex",
              gap: 10,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `linear-gradient(135deg, hsl(${c.avatarHue},70%,55%), hsl(${c.avatarHue + 40},70%,45%))`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  background: "#F3F2EF",
                  borderRadius: 10,
                  padding: "8px 12px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 11, color: "#5E5E5E" }}>{c.title}</div>
                <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>
                  {c.text}
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#5E5E5E",
                  marginTop: 4,
                  display: "flex",
                  gap: 14,
                }}
              >
                <span>J'aime</span>
                <span>·</span>
                <span>Répondre</span>
                <span>·</span>
                <span>2 h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
