import { CategoryPage } from "../Category/Category"
import { PregnancySlider } from "./PregnancySlider"

export const HomePage = () => {
  return (
    <>
      <PregnancySlider />
      <div style={{backgroundColor: "#F2FCF8", padding: "50px 0"}}>
        <CategoryPage />
      </div>

    </>
  )
}