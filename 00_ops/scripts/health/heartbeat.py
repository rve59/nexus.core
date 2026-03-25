import requests
import argparse


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Send a heartbeat project create request")
    parser.add_argument(
        "--base-url", default="http://127.0.0.1:8078", help="Base API URL")
    parser.add_argument(
        "--name", default="Bootstrap-Nexus-App", help="Project name")
    parser.add_argument(
        "--description",
        default="The self-hosting Nexus workbench",
        help="Project description",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    url = f"{args.base_url}/projects"
    payload = {
        "name": args.name,
        "description": args.description,
    }

    response = requests.post(url, json=payload)

    print(f"Status Code: {response.status_code}")
    print(f"Full Text: '{response.text}'")

    if response.status_code == 200:
        print(response.json())


if __name__ == "__main__":
    main()
