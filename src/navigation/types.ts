export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  
  // Podcast screens - FIXED: podcastId should be string, not number
  PodcastList: {
    categoryId?: string;
    categoryName?: string;
  } | undefined;
  PodcastDetail: { 
    podcastId: string; // Changed from number to string
  };
  AudioPlayerScreen: { podcastId: string };
  Search: undefined;
  Favorites: undefined;

  
  // Profile screens
  Profile: undefined;
  DetailsProfileScreen: undefined;
  EditProfileScreen: undefined;
  AccountSettingsScreen: undefined;
  AccountSecurityScreen: undefined;
  ChangePasswordScreen: undefined;
};

// Tab Navigator Types
export type TabParamList = {
  Home: undefined;
  Favorites: undefined;
  Profile: undefined;
};
