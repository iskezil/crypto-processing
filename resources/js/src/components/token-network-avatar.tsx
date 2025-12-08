import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type TokenNetworkAvatarProps = {
  tokenIcon?: string | null;
  networkIcon?: string | null;
  name?: string;
  size?: number;
  networkSize?: number;
};

export function TokenNetworkAvatar({ tokenIcon, networkIcon, name, size = 48, networkSize }: TokenNetworkAvatarProps) {
  const smallSize = networkSize ?? Math.round(size * 0.42);

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Avatar src={tokenIcon || undefined} alt={name} sx={{ width: size, height: size }}>
        {name?.[0] ?? ''}
      </Avatar>

      {networkIcon && (
        <Avatar
          src={networkIcon || undefined}
          alt=""
          sx={{
            width: smallSize,
            height: smallSize,
            position: 'absolute',
            bottom: -(smallSize * 0.2),
            right: -(smallSize * 0.2),
            border: '2px solid',
            borderColor: 'background.paper',
            boxShadow: (theme) => theme.customShadows?.z8,
          }}
        />
      )}
    </Box>
  );
}
