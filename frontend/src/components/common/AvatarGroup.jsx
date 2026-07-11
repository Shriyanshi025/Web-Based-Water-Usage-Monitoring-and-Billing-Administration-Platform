import React from "react";
import { AvatarGroup as MuiAvatarGroup, Avatar, Tooltip } from "@mui/material";

/**
 * Reusable AvatarGroup component (Future Ready)
 * @param {Object} props
 * @param {Array} props.users - Array of user objects { id, name, avatarUrl }
 * @param {number} [props.max=4] - Max avatars to show
 */
const AvatarGroup = ({ users = [], max = 4 }) => {
    return (
        <MuiAvatarGroup max={max} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.875rem' } }}>
            {users.map((user, index) => (
                <Tooltip key={user.id || index} title={user.name || "User"}>
                    <Avatar alt={user.name} src={user.avatarUrl}>
                        {user.name ? user.name.charAt(0) : "U"}
                    </Avatar>
                </Tooltip>
            ))}
        </MuiAvatarGroup>
    );
};

export default React.memo(AvatarGroup);
