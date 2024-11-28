import { UserType } from "../../types.d";

interface AccountProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}

const Account = ({ user, setUser }: AccountProps) => {
  return (
    <div>
      <h1>{user.username}</h1>
      <button
        onClick={() =>
          setUser({
            ...user,
          })
        }
      >
        Logout
      </button>
    </div>
  );
};

export default Account;
