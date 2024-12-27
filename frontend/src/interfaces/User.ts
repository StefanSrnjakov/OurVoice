export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
  userReports: [{ 
		reportingUserId: string,
		reportReason: string 
	}],
  isBanned: boolean;
  role: string;
}
