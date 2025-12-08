import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type TokenNetworkAvatarProps = {
  tokenIcon?: string | null;
  networkIcon?: string | null;
  name?: string;
};

export function TokenNetworkAvatar({ tokenIcon, networkIcon, name }: TokenNetworkAvatarProps) {
  return (
    <Box sx={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
      <Avatar src={tokenIcon || undefined} alt={name} sx={{ width: 48, height: 48 }}>
        {name?.[0] ?? ''}
      </Avatar>

      {networkIcon && (
        <Avatar
          src={networkIcon || undefined}
          alt=""
          sx={{
            width: 20,
            height: 20,
            position: 'absolute',
            bottom: -4,
            right: -4,
            border: '2px solid',
            borderColor: 'background.paper',
            boxShadow: (theme) => theme.customShadows?.z8,
          }}
        />
      )}
    </Box>
  );
}
