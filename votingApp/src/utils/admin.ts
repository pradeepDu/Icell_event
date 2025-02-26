export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  export const getTimeRemaining = (endDate: string) => {
    const endTime = new Date(endDate).getTime();
    const now = new Date().getTime();
    const timeLeft = endTime - now;
  
    if (timeLeft <= 0) return "Voting period has ended";
  
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
    return `${days}d ${hours}h ${minutes}m remaining`;
  };
  