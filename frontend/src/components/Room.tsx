import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const Room = () => {
  const [searchParams, setSearchParms] = useSearchParams();
  const name = searchParams.get("name");

  useEffect(() => {
    // logic to init user to room
  }, [name]);

  return <div>Hi {name}</div>;
};

export default Room;
