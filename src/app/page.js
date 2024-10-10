

import Header from "./components/Module/Header"; // импортируем Header
import { UserProvider } from './components/Auth/UserProvider';


export default function Home() {


  return (
    <main >
      <UserProvider>
        <Header /> 

      </UserProvider>
      

    </main>
  );
}
