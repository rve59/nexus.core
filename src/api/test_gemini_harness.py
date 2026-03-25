import os
from dotenv import load_dotenv
from gemini_service import GeminiService
from rich.console import Console
from rich.panel import Panel

load_dotenv()
console = Console()

def test_harness():
    console.print(Panel.fit("[bold green]Modern GeminiService Test Harness (google-genai)[/bold green]", border_style="bright_blue"))
    
    # 1. Test Mock Mode
    console.print("\n[bold yellow]Scenario 1: Mock Mode (UI/UX Prototyping)[/bold yellow]")
    mock_service = GeminiService(mock=True)
    mock_response = mock_service.generate_content("Synthesize the Memory Layer for a Medical AI.")
    console.print(f"[dim]Prompt:[/dim] Synthesize the Memory Layer for a Medical AI.")
    console.print(f"[italic cyan]Mock Response:[/italic cyan]\n{mock_response}")

    # 2. Test Live Mode (Using Modern API)
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        live_service = GeminiService(mock=False)
        console.print(f"\n[bold green]Scenario 2: Live Mode (Modern Client: {live_service.model_id})[/bold green]")
        try:
            prompt = "Q: What is the primary purpose of an 'Actuator' in the Nexus Agentic MGT framework?\nA:"
            live_response = live_service.generate_content(prompt)
            console.print(f"[dim]Prompt:[/dim] {prompt}")
            console.print(f"[bold green]Live Response:[/bold green]\n{live_response}")
        except Exception as e:
            console.print(f"[bold red]Live Mode Error:[/bold red] {str(e)}")

        live_service_pro = GeminiService(model_id='gemini-3-pro-preview', mock=False)
        console.print(f"\n[bold green]Scenario 3: Live Mode (Modern Client: {live_service_pro.model_id})[/bold green]")
        try:
            prompt = "Q: What is the primary purpose of an 'Actuator' in the Nexus Agentic MGT framework?\nA:"
            live_response = live_service.generate_content(prompt)
            console.print(f"[dim]Prompt:[/dim] {prompt}")
            console.print(f"[bold green]Live Response:[/bold green]\n{live_response}")
        except Exception as e:
            console.print(f"[bold red]Live Mode Error:[/bold red] {str(e)}")
    else:
        console.print("\n[bold red]Scenario 2 Skip: No API Key found in .env[/bold red]")

if __name__ == "__main__":
    test_harness()
